import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// 请求拦截器：自动附加 Token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

function clearAuth() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userInfo');
  document.cookie = 'token=; path=/; max-age=0';
  document.cookie = 'refreshToken=; path=/; max-age=0';
  window.location.href = '/login';
}

// 响应拦截器：处理 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      clearAuth();
    }
    return Promise.reject(err);
  }
);

// ==================== 灵修记录 API ====================
export const reflectionApi = {
  /** 创建灵修记录 */
  create: (data: {
    generationRecordId?: string;
    referenceText: string;
    title?: string;
    content: string;
    visibility?: string;
  }) => api.post('/reflections', data),

  /** 获取灵修记录列表 */
  list: (page = 1, size = 10) =>
    api.get('/reflections', { params: { page, size } }),

  /** 获取灵修记录详情 */
  detail: (id: string) => api.get(`/reflections/${id}`),

  /** 删除灵修记录 */
  delete: (id: string) => api.delete(`/reflections/${id}`),
};

// ==================== 赞美歌曲 API ====================
export const praiseApi = {
  /** 获取随机赞美歌曲 */
  random: () => api.get('/praise/random'),
};

// ==================== 联系牧者 API ====================
export const contactApi = {
  /** 提交联系牧者表单 */
  contactPastor: (data: {
    name: string;
    gender: string;
    wechatName?: string;
    phone?: string;
    email: string;
    location: string;
  }) => api.post('/contact/pastor', data),
};

// ==================== 今日随想 API ====================
export const dailyThoughtApi = {
  /** 生成今日随想回应 */
  generate: (content: string) =>
    api.post('/daily-thought/generate', { content: content.trim() }),

  /** 保存今日随想到历史记录 */
  save: (data: {
    content: string;
    pastoralResponse?: string;
    divineWord?: string;
    hymn?: string;
    scriptures: { reference: string; text: string; relevance: string }[];
  }) => api.post('/daily-thought/save', data),

  /** 获取历史记录列表 */
  history: (page = 1, size = 10) =>
    api.get('/daily-thought/history', { params: { page, size } }),
};

// ==================== 经文划线/默想 API ====================
export const annotationApi = {
  create: (data: {
    referenceText: string;
    versionId: string;
    bookId: string;
    chapterNumber: number;
    startVerse: number;
    endVerse: number;
    selectedText?: string;
    noteContent?: string;
    visibility?: 'private' | 'public';
  }) => api.post('/annotations', data),

  list: (params: { versionId: string; bookId: string; chapterNumber: number }) =>
    api.get('/annotations', { params }),

  listPublic: (params: { versionId: string; bookId: string; chapterNumber: number }) =>
    api.get('/annotations/public', { params }),

  update: (id: string, data: { noteContent?: string; visibility?: 'private' | 'public' }) =>
    api.put(`/annotations/${id}`, data),

  delete: (id: string) => api.delete(`/annotations/${id}`),
};

// ==================== 经文收藏 API ====================
export const bookmarkApi = {
  toggle: (data: {
    versionId: string;
    bookId: string;
    chapterNumber: number;
    verseNumber: number;
  }) => api.post('/bookmarks', data),

  list: (page = 1, size = 20) =>
    api.get('/bookmarks', { params: { page, size } }),

  check: (params: {
    versionId: string;
    bookId: string;
    chapterNumber: number;
    verseNumber: number;
  }) => api.get('/bookmarks/check', { params }),
};

// ==================== 私信 API ====================
export const messageApi = {
  listSessions: (page = 1, size = 20) =>
    api.get('/messages/sessions', { params: { page, size } }),

  createSession: (userId: string) =>
    api.post('/messages/sessions', { userId }),

  listMessages: (sessionId: string, page = 1, size = 50) =>
    api.get(`/messages/sessions/${sessionId}/messages`, { params: { page, size } }),

  sendMessage: (sessionId: string, content: string) =>
    api.post(`/messages/sessions/${sessionId}/messages`, { content: content.trim() }),

  canMessage: (userId: string) =>
    api.get(`/messages/can-message/${userId}`),
};

export default api;
export { API_BASE };