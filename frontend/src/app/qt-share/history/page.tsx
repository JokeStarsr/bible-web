'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { useI18n } from '@/i18n/I18nContext';

interface ResponseItem {
  responseId: string;
  userId: string;
  username: string;
  displayName: string;
  qtContentId: string;
  qtDate: string;
  title: string;
  scriptureReference: string;
  meditation: string;
  application: string;
  prayer: string;
  photos: string[];
  createdAt: string;
}

interface UserGroup {
  userId: string;
  username: string;
  displayName: string;
  responses: ResponseItem[];
}

export default function QtHistoryPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [error, setError] = useState('');

  // 展开状态：第一层用户分组，第二层具体回应
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [expandedResponse, setExpandedResponse] = useState<string | null>(null);

  // 编辑状态（仅自己的回应可编辑）
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMeditation, setEditMeditation] = useState('');
  const [editApplication, setEditApplication] = useState('');
  const [editPrayer, setEditPrayer] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 视图模式：按用户名分类 / 按时间排序
  const [viewMode, setViewMode] = useState<'user' | 'time'>('user');
  // 按时间视图的分页（默认5条/页）
  const PAGE_SIZE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      document.cookie = 'token=; path=/; max-age=0';
      document.cookie = 'refreshToken=; path=/; max-age=0';
      window.location.href = '/login';
      return;
    }
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      setCurrentUserId(userInfo.id || '');
    } catch {
      // ignore
    }
    setCheckingAuth(false);
    loadAllResponses();
  }, []);

  const loadAllResponses = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/qt/all-responses');
      setResponses(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  // 按用户名分组
  const userGroups: UserGroup[] = useMemo(() => {
    const map = new Map<string, UserGroup>();
    for (const r of responses) {
      if (!map.has(r.userId)) {
        map.set(r.userId, {
          userId: r.userId,
          username: r.username || '用户',
          displayName: r.displayName || r.username || '用户',
          responses: [],
        });
      }
      map.get(r.userId)!.responses.push(r);
    }
    // 每个用户组内按日期倒序（API 已按 created_at 倒序，这里保持）
    return Array.from(map.values());
  }, [responses]);

  // 按时间排序：当天优先（API 已按 created_at 倒序，当天自然在前）
  const timeSortedResponses: ResponseItem[] = useMemo(() => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    // 当天（qtDate = 今天）的排前，其余按原序（created_at 倒序）
    const todayList = responses.filter((r) => r.qtDate === todayStr);
    const otherList = responses.filter((r) => r.qtDate !== todayStr);
    return [...todayList, ...otherList];
  }, [responses]);

  // 分页计算
  const totalPages = Math.max(1, Math.ceil(timeSortedResponses.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedResponses = timeSortedResponses.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    setExpandedResponse(null);
    setEditingId(null);
  };

  const toggleUser = (userId: string) => {
    setExpandedUser(expandedUser === userId ? null : userId);
    setExpandedResponse(null);
    setEditingId(null);
  };

  const toggleResponse = (responseId: string) => {
    setExpandedResponse(expandedResponse === responseId ? null : responseId);
    setEditingId(null);
  };

  const startEdit = (item: ResponseItem) => {
    setEditingId(item.responseId);
    setEditMeditation(item.meditation || '');
    setEditApplication(item.application || '');
    setEditPrayer(item.prayer || '');
    setExpandedResponse(item.responseId);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (item: ResponseItem) => {
    setSaving(true);
    try {
      await api.post('/qt/response', {
        qtContentId: item.qtContentId,
        meditation: editMeditation,
        application: editApplication,
        prayer: editPrayer,
        photos: item.photos || [],
      });
      setEditingId(null);
      await loadAllResponses();
    } catch (err: any) {
      setError(err.response?.data?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: ResponseItem) => {
    if (!window.confirm(`确定删除 ${item.qtDate} 的回应吗？此操作不可撤销。`)) return;
    setDeletingId(item.responseId);
    try {
      await api.delete(`/qt/response/by-id/${item.responseId}`);
      await loadAllResponses();
    } catch (err: any) {
      setError(err.response?.data?.message || '删除失败');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-bible-gold text-lg animate-pulse">{t('qtHistory.checkingAuth')}</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">
      <div className="pt-4">
        <button
          onClick={() => router.push('/qt-share')}
          className="inline-flex items-center gap-1 text-bible-muted hover:text-bible-gold transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('qtHistory.back')}
        </button>
      </div>

      <div className="text-center py-4">
        <h1 className="text-3xl font-bold text-bible-dark mb-2">{t('qtHistory.title')}</h1>
        <p className="text-bible-muted">切换查看方式，点开条目查看默想内容，可管理自己的回应</p>
      </div>

      {/* 视图切换 Tab */}
      {!loading && responses.length > 0 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setViewMode('user')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              viewMode === 'user'
                ? 'bg-bible-gold text-white'
                : 'bg-bible-warm/40 text-bible-dark hover:bg-bible-warm/60'
            }`}
          >
            按用户名
          </button>
          <button
            onClick={() => { setViewMode('time'); setCurrentPage(1); setExpandedResponse(null); setEditingId(null); }}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              viewMode === 'time'
                ? 'bg-bible-gold text-white'
                : 'bg-bible-warm/40 text-bible-dark hover:bg-bible-warm/60'
            }`}
          >
            按时间
          </button>
        </div>
      )}

      {error && (
        <div className="text-center text-red-500 bg-red-50 rounded-lg py-3 px-4">{error}</div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="text-bible-gold text-lg animate-pulse">{t('qtHistory.loading')}</div>
        </div>
      )}

      {!loading && responses.length === 0 && (
        <div className="scripture-card text-center py-12">
          <p className="text-bible-muted">{t('qtHistory.noRecords')}</p>
        </div>
      )}

      {/* 按用户名分类视图 */}
      {!loading && responses.length > 0 && viewMode === 'user' && (
        <div className="space-y-4">
          {/* 第一层：按用户名分类 */}
          {userGroups.map((group) => {
            const isExpanded = expandedUser === group.userId;
            const isMe = group.userId === currentUserId;
            return (
              <div key={group.userId} className="scripture-card overflow-hidden">
                <button
                  onClick={() => toggleUser(group.userId)}
                  className="w-full flex items-center justify-between px-4 py-4 bg-bible-warm/30 hover:bg-bible-warm/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${isMe ? 'bg-bible-gold' : 'bg-bible-muted'}`}>
                      {group.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-bible-dark">{group.displayName}</span>
                        {isMe && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">我</span>
                        )}
                      </div>
                      <span className="text-sm text-bible-muted">{group.responses.length} 条回应</span>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-bible-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* 第二层：该用户的回应列表 */}
                {isExpanded && (
                  <div className="divide-y divide-bible-warm/50">
                    {group.responses.map((item) => {
                      const respExpanded = expandedResponse === item.responseId;
                      const isEditing = editingId === item.responseId;
                      const canManage = item.userId === currentUserId;
                      return (
                        <div key={item.responseId} className="p-4">
                          <button
                            onClick={() => toggleResponse(item.responseId)}
                            className="w-full text-left"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-sm text-bible-muted">{formatDate(item.qtDate)}</span>
                                <h3 className="text-base font-semibold text-bible-dark mt-1">{item.title}</h3>
                                {item.scriptureReference && (
                                  <p className="text-sm text-bible-gold mt-0.5">{item.scriptureReference}</p>
                                )}
                              </div>
                              <svg
                                className={`w-4 h-4 text-bible-muted transition-transform ${respExpanded ? 'rotate-180' : ''}`}
                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </button>

                          {/* 第三层：具体回应内容 */}
                          {respExpanded && !isEditing && (
                            <div className="mt-4 pt-4 border-t border-bible-warm/50 space-y-3">
                              {item.meditation && (
                                <div>
                                  <p className="text-xs font-medium text-bible-gold mb-1">{t('qtHistory.meditation')}</p>
                                  <p className="text-sm text-bible-dark whitespace-pre-wrap">{item.meditation}</p>
                                </div>
                              )}
                              {item.application && (
                                <div>
                                  <p className="text-xs font-medium text-bible-gold mb-1">{t('qtHistory.application')}</p>
                                  <p className="text-sm text-bible-dark whitespace-pre-wrap">{item.application}</p>
                                </div>
                              )}
                              {item.prayer && (
                                <div>
                                  <p className="text-xs font-medium text-bible-gold mb-1">{t('qtHistory.prayer')}</p>
                                  <p className="text-sm text-bible-dark whitespace-pre-wrap">{item.prayer}</p>
                                </div>
                              )}
                              {item.photos && item.photos.length > 0 && (
                                <div>
                                  <p className="text-xs font-medium text-bible-gold mb-1">照片</p>
                                  <div className="flex flex-wrap gap-2">
                                    {item.photos.map((p, i) => (
                                      <img key={i} src={p} alt={`照片${i + 1}`} className="w-20 h-20 object-cover rounded" />
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* 仅自己的回应显示修改/删除按钮 */}
                              {canManage && (
                                <div className="flex gap-2 pt-2">
                                  <button
                                    onClick={() => startEdit(item)}
                                    className="px-3 py-1.5 text-sm bg-bible-gold text-white rounded hover:bg-amber-600 transition-colors"
                                  >
                                    修改
                                  </button>
                                  <button
                                    onClick={() => handleDelete(item)}
                                    disabled={deletingId === item.responseId}
                                    className="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                                  >
                                    {deletingId === item.responseId ? '删除中...' : '删除'}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* 编辑模式 */}
                          {respExpanded && isEditing && (
                            <div className="mt-4 pt-4 border-t border-bible-warm/50 space-y-3">
                              <div>
                                <label className="text-xs font-medium text-bible-gold mb-1 block">{t('qtHistory.meditation')}</label>
                                <textarea
                                  value={editMeditation}
                                  onChange={(e) => setEditMeditation(e.target.value)}
                                  rows={3}
                                  className="w-full text-sm border border-bible-warm rounded-lg p-2 focus:outline-none focus:border-bible-gold"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-bible-gold mb-1 block">{t('qtHistory.application')}</label>
                                <textarea
                                  value={editApplication}
                                  onChange={(e) => setEditApplication(e.target.value)}
                                  rows={3}
                                  className="w-full text-sm border border-bible-warm rounded-lg p-2 focus:outline-none focus:border-bible-gold"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-bible-gold mb-1 block">{t('qtHistory.prayer')}</label>
                                <textarea
                                  value={editPrayer}
                                  onChange={(e) => setEditPrayer(e.target.value)}
                                  rows={3}
                                  className="w-full text-sm border border-bible-warm rounded-lg p-2 focus:outline-none focus:border-bible-gold"
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSaveEdit(item)}
                                  disabled={saving}
                                  className="px-4 py-1.5 text-sm bg-bible-gold text-white rounded hover:bg-amber-600 transition-colors disabled:opacity-50"
                                >
                                  {saving ? '保存中...' : '保存'}
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="px-4 py-1.5 text-sm border border-bible-warm text-bible-dark rounded hover:bg-bible-warm/30 transition-colors"
                                >
                                  取消
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 按时间排序视图（当天优先，分页5条/页） */}
      {!loading && responses.length > 0 && viewMode === 'time' && (
        <div className="space-y-4">
          {/* 当天提示 */}
          {timeSortedResponses.length > 0 && timeSortedResponses[0].qtDate === (() => {
            const d = new Date();
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          })() && (
            <div className="flex justify-center">
              <span className="text-xs text-bible-gold bg-amber-50 rounded-full py-1.5 px-3">
                以下为今日最新回应（优先展示）
              </span>
            </div>
          )}

          {pagedResponses.map((item) => {
            const respExpanded = expandedResponse === item.responseId;
            const isEditing = editingId === item.responseId;
            const canManage = item.userId === currentUserId;
            const isMe = item.userId === currentUserId;
            const isToday = (() => {
              const d = new Date();
              const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
              return item.qtDate === todayStr;
            })();
            return (
              <div key={item.responseId} className={`scripture-card overflow-hidden ${isToday ? 'ring-1 ring-bible-gold/40' : ''}`}>
                <button
                  onClick={() => toggleResponse(item.responseId)}
                  className="w-full text-left px-4 py-4 bg-bible-warm/30 hover:bg-bible-warm/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-bible-muted">{formatDate(item.qtDate)}</span>
                        {isToday && (
                          <span className="text-xs bg-bible-gold text-white px-2 py-0.5 rounded-full">今日</span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${isMe ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                          {item.displayName || item.username || '用户'}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-bible-dark mt-1">{item.title}</h3>
                      {item.scriptureReference && (
                        <p className="text-sm text-bible-gold mt-0.5">{item.scriptureReference}</p>
                      )}
                    </div>
                    <svg
                      className={`w-4 h-4 text-bible-muted transition-transform flex-shrink-0 ${respExpanded ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* 展开后的具体内容 */}
                {respExpanded && !isEditing && (
                  <div className="px-4 pb-4 pt-3 border-t border-bible-warm/50 space-y-3">
                    {item.meditation && (
                      <div>
                        <p className="text-xs font-medium text-bible-gold mb-1">{t('qtHistory.meditation')}</p>
                        <p className="text-sm text-bible-dark whitespace-pre-wrap">{item.meditation}</p>
                      </div>
                    )}
                    {item.application && (
                      <div>
                        <p className="text-xs font-medium text-bible-gold mb-1">{t('qtHistory.application')}</p>
                        <p className="text-sm text-bible-dark whitespace-pre-wrap">{item.application}</p>
                      </div>
                    )}
                    {item.prayer && (
                      <div>
                        <p className="text-xs font-medium text-bible-gold mb-1">{t('qtHistory.prayer')}</p>
                        <p className="text-sm text-bible-dark whitespace-pre-wrap">{item.prayer}</p>
                      </div>
                    )}
                    {item.photos && item.photos.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-bible-gold mb-1">照片</p>
                        <div className="flex flex-wrap gap-2">
                          {item.photos.map((p, i) => (
                            <img key={i} src={p} alt={`照片${i + 1}`} className="w-20 h-20 object-cover rounded" />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 仅自己的回应显示修改/删除按钮 */}
                    {canManage && (
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => startEdit(item)}
                          className="px-3 py-1.5 text-sm bg-bible-gold text-white rounded hover:bg-amber-600 transition-colors"
                        >
                          修改
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          disabled={deletingId === item.responseId}
                          className="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {deletingId === item.responseId ? '删除中...' : '删除'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 编辑模式 */}
                {respExpanded && isEditing && (
                  <div className="px-4 pb-4 pt-3 border-t border-bible-warm/50 space-y-3">
                    <div>
                      <label className="text-xs font-medium text-bible-gold mb-1 block">{t('qtHistory.meditation')}</label>
                      <textarea
                        value={editMeditation}
                        onChange={(e) => setEditMeditation(e.target.value)}
                        rows={3}
                        className="w-full text-sm border border-bible-warm rounded-lg p-2 focus:outline-none focus:border-bible-gold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-bible-gold mb-1 block">{t('qtHistory.application')}</label>
                      <textarea
                        value={editApplication}
                        onChange={(e) => setEditApplication(e.target.value)}
                        rows={3}
                        className="w-full text-sm border border-bible-warm rounded-lg p-2 focus:outline-none focus:border-bible-gold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-bible-gold mb-1 block">{t('qtHistory.prayer')}</label>
                      <textarea
                        value={editPrayer}
                        onChange={(e) => setEditPrayer(e.target.value)}
                        rows={3}
                        className="w-full text-sm border border-bible-warm rounded-lg p-2 focus:outline-none focus:border-bible-gold"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(item)}
                        disabled={saving}
                        className="px-4 py-1.5 text-sm bg-bible-gold text-white rounded hover:bg-amber-600 transition-colors disabled:opacity-50"
                      >
                        {saving ? '保存中...' : '保存'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-1.5 text-sm border border-bible-warm text-bible-dark rounded hover:bg-bible-warm/30 transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* 分页控件 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => goToPage(safePage - 1)}
                disabled={safePage <= 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-bible-warm text-bible-dark hover:bg-bible-warm/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              <span className="text-sm text-bible-muted px-2">
                第 {safePage} / {totalPages} 页（共 {timeSortedResponses.length} 条）
              </span>
              <button
                onClick={() => goToPage(safePage + 1)}
                disabled={safePage >= totalPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-bible-warm text-bible-dark hover:bg-bible-warm/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>
          )}
          {totalPages === 1 && timeSortedResponses.length > 0 && (
            <div className="text-center text-xs text-bible-muted">共 {timeSortedResponses.length} 条</div>
          )}
        </div>
      )}
    </div>
  );
}
