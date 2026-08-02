'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { ChatMessageInfo } from '@/services/chatApi';

// 服务端推送的消息条目
export interface ChatWSEntry {
  type: 'message' | 'pong' | 'delete';
  roomId?: string;
  message?: ChatMessageInfo;
  messageId?: string;
}

type MessageCallback = (message: ChatMessageInfo) => void;
type DeleteCallback = (messageId: string) => void;

// 心跳间隔（毫秒）
const HEARTBEAT_INTERVAL = 25_000;
// 断线重连间隔（毫秒）
const RECONNECT_INTERVAL = 3_000;

/**
 * 主内通讯 WebSocket Hook
 * - 进入页面建立连接，离开页面关闭
 * - 25 秒发送一次心跳保活
 * - 断线 3 秒自动重连
 * - 支持 subscribe(roomId, cb) 按房间订阅消息
 * - 支持 subscribeAll(cb) 订阅所有消息（用于更新侧栏未读数等）
 */
export function useChatWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  // 按房间订阅的回调集合：roomId -> Set<callback>
  const roomListenersRef = useRef<Map<string, Set<MessageCallback>>>(new Map());
  // 全局监听器（接收所有房间的消息）
  const globalListenersRef = useRef<Set<MessageCallback>>(new Set());
  // 按房间订阅的删除回调集合：roomId -> Set<callback>
  const roomDeleteListenersRef = useRef<Map<string, Set<DeleteCallback>>>(new Map());
  // 心跳定时器
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // 重连定时器
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 是否已经主动关闭（组件卸载时使用，避免触发重连）
  const closedManuallyRef = useRef(false);

  const [connected, setConnected] = useState(false);

  // 清理心跳和重连定时器
  const clearTimers = useCallback(() => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  // 建立连接
  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) return; // 未登录不连接

    // 若已有连接则先关闭
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {
        /* ignore */
      }
      wsRef.current = null;
    }

    const wsUrl =
      (window.location.protocol === 'https:' ? 'wss:' : 'ws:') +
      '//' +
      window.location.host +
      '/ws-chat?token=' +
      token;

    let ws: WebSocket;
    try {
      ws = new WebSocket(wsUrl);
    } catch {
      // WebSocket 构造失败，3 秒后重试
      reconnectTimerRef.current = setTimeout(connect, RECONNECT_INTERVAL);
      return;
    }
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      // 启动心跳
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = setInterval(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          try {
            wsRef.current.send(JSON.stringify({ type: 'ping' }));
          } catch {
            /* ignore */
          }
        }
      }, HEARTBEAT_INTERVAL);
    };

    ws.onmessage = (event) => {
      let entry: ChatWSEntry;
      try {
        entry = JSON.parse(event.data) as ChatWSEntry;
      } catch {
        return; // 忽略无法解析的消息
      }
      if (entry.type === 'pong' || !entry.roomId) return;

      // 删除消息事件
      if (entry.type === 'delete' && entry.messageId) {
        const delListeners = roomDeleteListenersRef.current.get(entry.roomId);
        if (delListeners) {
          delListeners.forEach((cb) => {
            try {
              cb(entry.messageId!);
            } catch {
              /* ignore */
            }
          });
        }
        return;
      }

      // 新消息事件
      if (!entry.message) return;
      const message = entry.message;
      // 派发到对应房间的订阅者
      const listeners = roomListenersRef.current.get(entry.roomId);
      if (listeners) {
        listeners.forEach((cb) => {
          try {
            cb(message);
          } catch {
            /* ignore */
          }
        });
      }
      // 派发到全局监听器
      globalListenersRef.current.forEach((cb) => {
        try {
          cb(message);
        } catch {
          /* ignore */
        }
      });
    };

    ws.onclose = () => {
      setConnected(false);
      clearTimers();
      wsRef.current = null;
      // 非主动关闭时自动重连
      if (!closedManuallyRef.current) {
        reconnectTimerRef.current = setTimeout(connect, RECONNECT_INTERVAL);
      }
    };

    ws.onerror = () => {
      // 出错后让 onclose 处理重连
      try {
        ws.close();
      } catch {
        /* ignore */
      }
    };
  }, [clearTimers]);

  // 进入页面时建立连接
  useEffect(() => {
    closedManuallyRef.current = false;
    connect();
    return () => {
      // 组件卸载：关闭连接，停止重连
      closedManuallyRef.current = true;
      clearTimers();
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {
          /* ignore */
        }
        wsRef.current = null;
      }
    };
  }, [connect, clearTimers]);

  // 订阅指定房间的消息推送，返回取消订阅函数
  const subscribe = useCallback((roomId: string, callback: MessageCallback) => {
    let set = roomListenersRef.current.get(roomId);
    if (!set) {
      set = new Set();
      roomListenersRef.current.set(roomId, set);
    }
    set.add(callback);
    return () => {
      const s = roomListenersRef.current.get(roomId);
      if (s) {
        s.delete(callback);
        if (s.size === 0) {
          roomListenersRef.current.delete(roomId);
        }
      }
    };
  }, []);

  // 订阅所有房间的消息推送（用于更新侧栏未读数/最后消息），返回取消订阅函数
  const subscribeAll = useCallback((callback: MessageCallback) => {
    globalListenersRef.current.add(callback);
    return () => {
      globalListenersRef.current.delete(callback);
    };
  }, []);

  // 订阅指定房间的消息删除事件，返回取消订阅函数
  const subscribeDelete = useCallback((roomId: string, callback: DeleteCallback) => {
    let set = roomDeleteListenersRef.current.get(roomId);
    if (!set) {
      set = new Set();
      roomDeleteListenersRef.current.set(roomId, set);
    }
    set.add(callback);
    return () => {
      const s = roomDeleteListenersRef.current.get(roomId);
      if (s) {
        s.delete(callback);
        if (s.size === 0) {
          roomDeleteListenersRef.current.delete(roomId);
        }
      }
    };
  }, []);

  // 主动发送原始数据（备用，目前心跳内部已用）
  const send = useCallback((data: unknown) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(typeof data === 'string' ? data : JSON.stringify(data));
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }, []);

  return { connected, subscribe, subscribeAll, subscribeDelete, send };
}

export default useChatWebSocket;
