import api from './api';

// ==================== 类型定义 ====================
export interface CourtshipProfile {
  id: string;
  userId: string;
  nickname: string;
  username?: string;
  avatarUrl?: string;
  gender: 'MALE' | 'FEMALE';
  birthDate?: string;
  age?: number;
  region?: string;
  occupation?: string;
  bio?: string;
  beliefYears?: number;
  churchName?: string;
  ministryRole?: string;
  seekingGender?: 'MALE' | 'FEMALE';
  seekingAgeMin?: number;
  seekingAgeMax?: number;
  seekingRegion?: string;
  photos?: string; // 逗号分隔字符串
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN';
  rejectReason?: string;
  createdAt?: string;
  updatedAt?: string;
  likedByMe?: boolean;
}

export interface ProfileRequest {
  nickname: string;
  gender: 'MALE' | 'FEMALE';
  birthDate?: string;
  region?: string;
  occupation?: string;
  bio?: string;
  beliefYears?: number;
  churchName?: string;
  ministryRole?: string;
  /** 期望对方性别，空字符串表示不限，提交时空字符串会被过滤为 undefined */
  seekingGender?: '' | 'MALE' | 'FEMALE';
  seekingAgeMin?: number;
  seekingAgeMax?: number;
  seekingRegion?: string;
  photos?: string[];
}

export interface LikeRequest {
  toUserId: string;
  message?: string;
}

export interface LikeResponse {
  id: string;
  toUserId: string;
  toNickname: string;
  toAvatarUrl?: string;
  message?: string;
  matched: boolean;
  createdAt: string;
}

export interface MatchResponse {
  id: string;
  otherUserId: string;
  otherNickname: string;
  otherAvatarUrl?: string;
  roomId: string;
  status: 'ACTIVE' | 'DISSOLVED';
  createdAt: string;
}

export interface WitnessRequest {
  title: string;
  content: string;
  photoUrl?: string;
}

export interface WitnessResponse {
  id: string;
  userId: string;
  nickname?: string;
  title: string;
  content: string;
  photoUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectReason?: string;
  createdAt: string;
}

export interface ReportRequest {
  reportedId: string;
  reason: 'INAPPROPRIATE' | 'FAKE' | 'SPAM' | 'OTHER';
  detail?: string;
}

export interface PageResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

// ==================== API ====================
export const courtshipApi = {
  // 资料
  getMyProfile: () =>
    api.get('/courtship/profile').then((r) => r.data.data as CourtshipProfile | null),

  upsertProfile: (data: ProfileRequest) =>
    api.put('/courtship/profile', data).then((r) => r.data.data as CourtshipProfile),

  listProfiles: (params: { gender?: string; region?: string; page?: number; size?: number }) =>
    api
      .get('/courtship/profiles', { params })
      .then((r) => r.data.data as PageResult<CourtshipProfile>),

  getProfileDetail: (userId: string) =>
    api.get(`/courtship/profiles/${userId}`).then((r) => r.data.data as CourtshipProfile),

  // 心动
  like: (data: LikeRequest) =>
    api.post('/courtship/likes', data).then((r) => r.data.data as MatchResponse | null),

  myLikes: () => api.get('/courtship/likes').then((r) => r.data.data as LikeResponse[]),

  // 匹配
  myMatches: () => api.get('/courtship/matches').then((r) => r.data.data as MatchResponse[]),

  dissolveMatch: (matchId: string) => api.delete(`/courtship/matches/${matchId}`),

  // 见证
  submitWitness: (data: WitnessRequest) => api.post('/courtship/witnesses', data),

  listWitnesses: (page = 1, size = 10) =>
    api
      .get('/courtship/witnesses', { params: { page, size } })
      .then((r) => r.data.data as PageResult<WitnessResponse>),

  myWitnesses: () => api.get('/courtship/witnesses/mine').then((r) => r.data.data as WitnessResponse[]),

  // 举报
  report: (data: ReportRequest) => api.post('/courtship/reports', data),

  // 上传照片
  uploadPhoto: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api
      .post('/courtship/upload-photo', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data.data as string);
  },
};
