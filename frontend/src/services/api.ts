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

// 响应拦截器：处理 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
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

export default api;
export { API_BASE };