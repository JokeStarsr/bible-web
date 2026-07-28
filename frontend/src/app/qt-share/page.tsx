'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

type Lang = 'zh' | 'ko';

interface QtContent {
  id: string;
  qtDate: string;
  title: string;
  scriptureReference: string;
  scriptureText: string;
  commentary: string;
  hymn?: string;
  scriptureTextKo?: string;
  commentaryKo?: string;
  hymnKo?: string;
}

interface QtUserResponseItem {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  meditation: string;
  application: string;
  prayer: string;
  photos?: string[];
  createdAt: string;
}

const L = {
  zh: {
    qtTitle: 'QT 灵修',
    history: '历史',
    back: '返回',
    meditationEssay: '默想散文',
    scriptureExplain: '经文解释',
    todayHymn: '今日诗歌 · 真神之爱',
    scripture: '今日经文',
    meditation: '默想',
    myResponse: '我的灵修回应',
    meditationLabel: '默想',
    meditationPlaceholder: '这段经文让我想到...',
    applyLabel: '应用',
    applyPlaceholder: '我今天要如何活出这段经文...',
    prayerLabel: '祷告',
    prayerPlaceholder: '主啊，求你帮助我...',
    photoLabel: '照片（可选）',
    uploading: '上传中',
    image: '图片',
    saveBtn: '保存回应',
    saving: '保存中...',
    saved: '已保存',
    edit: '修改',
    delete: '删除',
    deleting: '删除中...',
    saveSuccess: '保存成功',
    community: '社区灵修分享',
    viewShares: '查看分享',
    loading: '加载中...',
    loadHint: '点击「查看分享」加载今日其他信徒的灵修回应',
    myBookmarks: '我的收藏',
    removeBookmark: '删除',
    highlight: '划线默想',
    bookmark: '收藏',
    copy: '复制',
    copied: '已复制到剪贴板',
    loadingContent: '正在加载今日灵修...',
    noContent: '暂无今日灵修内容',
    contactAdmin: '请联系管理员上传今日灵修内容',
    checkingAuth: '正在确认登录状态...',
    deleteConfirm: '确定要删除您的灵修回应吗？此操作不可撤销。',
    saveFail: '保存失败，请稍后再试',
    deleteFail: '删除失败，请稍后再试',
    brotherSister: '弟兄/姊妹',
    selectDate: '选择日期',
    goToday: '今天',
    confirm: '确定',
    cancel: '取消',
    noContentForDate: '该日期没有灵修内容',
  },
  ko: {
    qtTitle: 'QT 경건의 시간',
    history: '히스토리',
    back: '뒤로',
    meditationEssay: '묵상 산문',
    scriptureExplain: '성경 해설',
    todayHymn: '오늘의 찬송 · 하나님의 사랑',
    scripture: '오늘의 말씀',
    meditation: '묵상',
    myResponse: '나의 묵상 응답',
    meditationLabel: '묵상',
    meditationPlaceholder: '이 말씀을 통해 떠오른 생각...',
    applyLabel: '적용',
    applyPlaceholder: '오늘 내가 이 말씀을 어떻게 살아낼까...',
    prayerLabel: '기도',
    prayerPlaceholder: '주님, 도와주소서...',
    photoLabel: '사진 (선택)',
    uploading: '업로드 중',
    image: '사진',
    saveBtn: '응답 저장',
    saving: '저장 중...',
    saved: '저장됨',
    edit: '수정',
    delete: '삭제',
    deleting: '삭제 중...',
    saveSuccess: '저장 성공',
    community: '공동체 묵상 나눔',
    viewShares: '나눔 보기',
    loading: '로딩 중...',
    loadHint: '「나눔 보기」를 눌러 오늘 다른 성도들의 묵상 응답을 확인하세요',
    myBookmarks: '내 북마크',
    removeBookmark: '삭제',
    highlight: '밑줄 묵상',
    bookmark: '북마크',
    copy: '복사',
    copied: '클립보드에 복사됨',
    loadingContent: '오늘의 묵상을 불러오는 중...',
    noContent: '오늘의 묵상 콘텐츠가 없습니다',
    contactAdmin: '관리자에게 콘텐츠 업로드를 요청하세요',
    checkingAuth: '로그인 상태 확인 중...',
    deleteConfirm: '묵상 응답을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.',
    saveFail: '저장에 실패했습니다. 다시 시도해 주세요',
    deleteFail: '삭제에 실패했습니다. 다시 시도해 주세요',
    brotherSister: '형제/자매',
    selectDate: '날짜 선택',
    goToday: '오늘',
    confirm: '확인',
    cancel: '취소',
    noContentForDate: '해당 날짜의 묵상 콘텐츠가 없습니다',
  }
};

export default function QtSharePage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [lang, setLang] = useState<Lang>('zh');
  const t = L[lang];

  const [content, setContent] = useState<QtContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [meditation, setMeditation] = useState('');
  const [application, setApplication] = useState('');
  const [prayer, setPrayer] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');

  const [community, setCommunity] = useState<QtUserResponseItem[]>([]);
  const [communityLoading, setCommunityLoading] = useState(false);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const [selectionToolbar, setSelectionToolbar] = useState<{ x: number; y: number } | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const getTodayStr = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayStr);

  // Custom date picker state
  const initParts = getTodayStr().split('-');
  const [pickerYear, setPickerYear] = useState(() => parseInt(initParts[0]));
  const [pickerMonth, setPickerMonth] = useState(() => parseInt(initParts[1]));
  const [pickerDay, setPickerDay] = useState(() => parseInt(initParts[2]));

  const daysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();

  const todayParts = getTodayStr().split('-');
  const todayYear = parseInt(todayParts[0]);
  const todayMonth = parseInt(todayParts[1]);
  const todayDay = parseInt(todayParts[2]);

  const years = Array.from({ length: todayYear - 2023 }, (_, i) => 2024 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const getDays = () => {
    const maxD = (pickerYear === todayYear && pickerMonth === todayMonth) ? todayDay : daysInMonth(pickerYear, pickerMonth);
    return Array.from({ length: maxD }, (_, i) => i + 1);
  };

  const syncPickerFromDate = (d: string) => {
    const parts = d.split('-');
    setPickerYear(parseInt(parts[0]));
    setPickerMonth(parseInt(parts[1]));
    setPickerDay(parseInt(parts[2]));
  };

  useEffect(() => {
    const savedLang = localStorage.getItem('app-lang') as Lang;
    if (savedLang === 'ko' || savedLang === 'zh') setLang(savedLang);

    // Listen for language changes from NavBar
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'app-lang' && (e.newValue === 'zh' || e.newValue === 'ko')) {
        setLang(e.newValue as Lang);
      }
    };
    window.addEventListener('storage', onStorage);

    if (savedLang === 'ko' || savedLang === 'zh') setLang(savedLang);

    const token = localStorage.getItem('token');
    if (!token) {
      document.cookie = 'token=; path=/; max-age=0';
      document.cookie = 'refreshToken=; path=/; max-age=0';
      window.location.href = '/login';
      return;
    }
    setCheckingAuth(false);
    loadToday();
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const switchLang = (l: Lang) => {
    setLang(l);
    localStorage.setItem('app-lang', l);
  };

  const getField = (zhField: string | undefined, koField: string | undefined): string => {
    if (lang === 'ko' && koField) return koField;
    return zhField || '';
  };

  const loadToday = async () => {
    setLoading(true);
    setError('');
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      if (userInfo.id) setCurrentUserId(userInfo.id);
      const res = await api.get('/qt/today');
      setContent(res.data.data);
      const date = res.data.data.qtDate;
      try {
        const myRes = await api.get(`/qt/response/${date}`);
        const myData = myRes.data.data;
        setMeditation(myData.meditation || '');
        setApplication(myData.application || '');
        setPrayer(myData.prayer || '');
        setPhotos(myData.photos || []);
      } catch { /* unused */ }
    } catch (err: any) {
      setError(err.response?.data?.message || t.noContent);
      setContent(null);
    } finally {
      setLoading(false);
    }
  };

  const loadByDate = async (date: string) => {
    setLoading(true);
    setError('');
    setSaved(false);
    setMeditation('');
    setApplication('');
    setPrayer('');
    setPhotos([]);
    try {
      const res = await api.get(`/qt/date/${date}`);
      setContent(res.data.data);
      try {
        const myRes = await api.get(`/qt/response/${date}`);
        const myData = myRes.data.data;
        setMeditation(myData.meditation || '');
        setApplication(myData.application || '');
        setPrayer(myData.prayer || '');
        setPhotos(myData.photos || []);
        setSaved(true);
      } catch { /* unused */ }
    } catch (err: any) {
      setError(err.response?.data?.message || t.noContentForDate);
      setContent(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingPhotos(true);
    const uploaded: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('file', files[i]);
      try {
        const res = await api.post('/qt/photos', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploaded.push(res.data.data);
      } catch { /* skip */ }
    }
    setPhotos(prev => [...prev, ...uploaded]);
    setUploadingPhotos(false);
    e.target.value = '';
    setSaved(false);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!content) return;
    setSaving(true);
    setError('');
    try {
      await api.post('/qt/response', {
        qtContentId: content.id,
        meditation: meditation.trim(),
        application: application.trim(),
        prayer: prayer.trim(),
        photos: photos,
      });
      setSaved(true);
    } catch (err: any) {
      setError(err.response?.data?.message || t.saveFail);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!content || deleting) return;
    if (!confirm(t.deleteConfirm)) return;
    setDeleting(true);
    setError('');
    try {
      await api.delete(`/qt/response/${content.qtDate}`);
      setMeditation('');
      setApplication('');
      setPrayer('');
      setPhotos([]);
      setSaved(false);
    } catch (err: any) {
      setError(err.response?.data?.message || t.deleteFail);
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = () => { setSaved(false); };

  const loadCommunity = async () => {
    if (!content) return;
    setCommunityLoading(true);
    try {
      const res = await api.get(`/qt/responses/${content.qtDate}`);
      setCommunity(res.data.data || []);
    } catch { setCommunity([]); } finally { setCommunityLoading(false); }
  };

  const handleMouseUp = useCallback(() => {
    setTimeout(() => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) { setSelectionToolbar(null); return; }
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const x = Math.min(Math.max(rect.left + rect.width / 2, 160), window.innerWidth - 160);
      const y = rect.top - 56;
      setSelectionToolbar({ x, y: Math.max(y, 10) });
    }, 20);
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed && sel.toString().trim()) { e.preventDefault(); e.stopPropagation(); }
  }, []);

  const handleHighlight = () => {
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed) {
      try { document.execCommand('hiliteColor', false, '#FEF3C7'); }
      catch {
        try {
          const range = sel.getRangeAt(0);
          const mark = document.createElement('mark');
          mark.style.backgroundColor = '#FEF3C7'; mark.style.borderRadius = '3px'; mark.style.padding = '1px 4px';
          range.surroundContents(mark);
        } catch { /* ignore */ }
      }
      sel.removeAllRanges();
    }
    setSelectionToolbar(null);
  };

  const handleBookmark = () => {
    const sel = window.getSelection();
    if (sel) {
      const text = sel.toString().trim();
      if (text && !bookmarks.includes(text)) setBookmarks(prev => [...prev, text]);
      sel.removeAllRanges();
    }
    setSelectionToolbar(null);
  };

  const handleCopy = async () => {
    const sel = window.getSelection();
    if (sel) {
      const text = sel.toString();
      try { await navigator.clipboard.writeText(text); }
      catch { document.execCommand('copy'); }
      sel.removeAllRanges();
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 1500);
    }
    setSelectionToolbar(null);
  };

  const handleRemoveBookmark = (index: number) => { setBookmarks(prev => prev.filter((_, i) => i !== index)); };

  const getDayOfWeek = (dateStr: string) => {
    const daysKo = ['주일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const daysZh = ['主日', '礼拜一', '礼拜二', '礼拜三', '礼拜四', '礼拜五', '礼拜六'];
    const d = new Date(dateStr);
    return lang === 'ko' ? daysKo[d.getDay()] : daysZh[d.getDay()];
  };
  const getDayNumber = (dateStr: string) => new Date(dateStr).getDate();
  const getMonthDay = (dateStr: string) => {
    const d = new Date(dateStr);
    return lang === 'ko' ? `${d.getMonth() + 1}월 ${d.getDate()}일` : `${d.getMonth() + 1}月${d.getDate()}日`;
  };

  // Scripture rendering - bilingual Chinese+English or Korean only
  const renderScripture = () => {
    const isKo = lang === 'ko';
    const text = isKo ? (content?.scriptureTextKo || '') : (content?.scriptureText || '');
    if (!text) return null;

    if (isKo) {
      // Korean: show as paragraphs
      return (
        <div className="space-y-3">
          {text.split('\n\n').filter(p => p.trim()).map((para, i) => (
            <p key={i} className="text-[15px] text-gray-800 leading-relaxed">{para.trim()}</p>
          ))}
        </div>
      );
    }

    // Chinese + English bilingual
    const lines = text.split('\n');
    return lines.map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={i} className="h-2"></div>;
      const isEnglish = /^[A-Za-z"(]/.test(trimmed) && !/[\u4e00-\u9fff]/.test(trimmed);
      return (
        <p key={i} className={
          isEnglish
            ? 'text-[13px] text-gray-400 italic leading-relaxed pl-4 border-l-2 border-amber-200 my-0.5'
            : 'text-[15px] text-gray-800 leading-relaxed'
        }>{line}</p>
      );
    });
  };

  if (checkingAuth) {
    return <div className="min-h-screen flex items-center justify-center bg-[#FDF8F0]">
      <div className="text-amber-700 text-lg animate-pulse">{t.checkingAuth}</div>
    </div>;
  }

  const commentaryText = getField(content?.commentary, content?.commentaryKo);
  const hymnText = getField(content?.hymn, content?.hymnKo);

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      {/* Top bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-amber-100 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.push('/')} className="text-amber-700 hover:text-amber-900 transition-colors text-sm flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {t.back}
          </button>
          <span className="text-amber-900 font-medium text-sm">{t.qtTitle}</span>
          <div className="flex items-center gap-2">
            {/* Language switcher */}
            <div className="flex items-center bg-amber-50 rounded-lg border border-amber-200 p-0.5 mr-1">
              <button
                onClick={() => switchLang('zh')}
                className={`px-2 py-0.5 text-xs rounded-md transition-all ${lang === 'zh' ? 'bg-amber-500 text-white shadow-sm' : 'text-amber-600 hover:text-amber-800'}`}
              >中文</button>
              <button
                onClick={() => switchLang('ko')}
                className={`px-2 py-0.5 text-xs rounded-md transition-all ${lang === 'ko' ? 'bg-amber-500 text-white shadow-sm' : 'text-amber-600 hover:text-amber-800'}`}
              >한글</button>
            </div>
            <button onClick={() => router.push('/qt-share/history')} className="text-amber-700 hover:text-amber-900 transition-colors text-sm">{t.history}</button>
          </div>
        </div>
        {/* Date picker row */}
        <div className="max-w-2xl mx-auto px-4 py-2 flex items-center gap-2 flex-wrap">
          <label className="text-xs text-amber-600 font-medium">{t.selectDate}</label>
          <select
            value={pickerYear}
            onChange={(e) => setPickerYear(parseInt(e.target.value))}
            className="text-sm px-2 py-1.5 rounded-lg border border-amber-200 bg-white text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
          >
            {years.map(y => <option key={y} value={y}>{y}年</option>)}
          </select>
          <select
            value={pickerMonth}
            onChange={(e) => {
              const m = parseInt(e.target.value);
              setPickerMonth(m);
              const maxD = (pickerYear === todayYear && m === todayMonth) ? todayDay : daysInMonth(pickerYear, m);
              if (pickerDay > maxD) setPickerDay(maxD);
            }}
            className="text-sm px-2 py-1.5 rounded-lg border border-amber-200 bg-white text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
          >
            {months.map(m => <option key={m} value={m}>{m}月</option>)}
          </select>
          <select
            value={pickerDay}
            onChange={(e) => setPickerDay(parseInt(e.target.value))}
            className="text-sm px-2 py-1.5 rounded-lg border border-amber-200 bg-white text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
          >
            {getDays().map(d => <option key={d} value={d}>{d}日</option>)}
          </select>
          <button
            onClick={() => {
              const d = `${pickerYear}-${String(pickerMonth).padStart(2, '0')}-${String(pickerDay).padStart(2, '0')}`;
              setSelectedDate(d);
              if (d === getTodayStr()) {
                loadToday();
              } else {
                loadByDate(d);
              }
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors"
          >{t.confirm}</button>
          {selectedDate !== getTodayStr() && (
            <button
              onClick={() => { 
                const tdy = getTodayStr();
                setSelectedDate(tdy); 
                syncPickerFromDate(tdy);
                loadToday(); 
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
            >{t.goToday}</button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-16">
        {loading && <div className="text-center py-20"><div className="text-amber-700 text-lg animate-pulse">{t.loadingContent}</div></div>}
        {error && !content && <div className="text-center py-20"><p className="text-amber-800 text-lg mb-4">{error}</p><p className="text-amber-600">{t.contactAdmin}</p></div>}

        {content && (<>
          {/* QT Content Card */}
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
            {/* Tag bar */}
            <div className="flex items-center justify-between px-5 py-3 bg-amber-50/50 border-b border-amber-100">
              <div className="flex items-center gap-3">
                <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded">{t.meditationEssay}</span>
                <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded">{t.scriptureExplain}</span>
              </div>
              <span className="text-xs text-amber-500">{t.todayHymn}</span>
            </div>

            {/* Date + Title */}
            <div className="px-5 pt-5 pb-3">
              <div className="flex items-baseline gap-2 text-amber-500 text-sm mb-1">
                <span>{getDayOfWeek(content.qtDate)}</span>
                <span className="text-3xl font-bold text-amber-800">{getDayNumber(content.qtDate)}</span>
                <span className="text-xs text-amber-400">{getMonthDay(content.qtDate)}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">{content.title}</h1>
              {content.scriptureReference && <p className="text-amber-700 font-medium text-sm mt-1">{content.scriptureReference}</p>}
            </div>

            <div className="border-t border-amber-100"></div>

            {/* Scripture */}
            <div className="px-5 py-4" onMouseUp={handleMouseUp} onContextMenu={handleContextMenu} onTouchEnd={handleMouseUp}>
              <h3 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-amber-400 rounded-full"></span>{t.scripture}
              </h3>
              <div className="selection:bg-amber-200/60">{renderScripture()}</div>
            </div>

            {/* Commentary */}
            {commentaryText && (<>
              <div className="border-t border-amber-100"></div>
              <div className="px-5 py-4" onMouseUp={handleMouseUp} onContextMenu={handleContextMenu} onTouchEnd={handleMouseUp}>
                <h3 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 bg-amber-400 rounded-full"></span>{t.meditation}
                </h3>
                <div className="text-gray-700 leading-relaxed text-[15px] whitespace-pre-wrap selection:bg-amber-200/60">{commentaryText}</div>
              </div>
            </>)}

            {/* Hymn */}
            {hymnText && (<>
              <div className="border-t border-amber-100"></div>
              <div className="px-5 py-4 bg-rose-50/30">
                <h3 className="text-sm font-semibold text-rose-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                  {t.todayHymn}
                </h3>
                <div className="text-rose-800 leading-relaxed text-[15px] whitespace-pre-wrap italic">{hymnText}</div>
              </div>
            </>)}
          </div>

          {/* Bookmarks */}
          {bookmarks.length > 0 && (
            <div className="mt-4 bg-white rounded-xl shadow-sm border border-amber-200 p-4">
              <p className="text-sm font-medium text-amber-800 mb-2 flex items-center gap-1"><span>⭐</span> {t.myBookmarks}</p>
              <div className="space-y-1.5">
                {bookmarks.map((bm, i) => (
                  <div key={i} className="flex items-start justify-between gap-2 text-sm">
                    <p className="text-gray-700 flex-1 leading-relaxed">{bm}</p>
                    <button onClick={() => handleRemoveBookmark(i)} className="text-amber-400 hover:text-red-500 text-xs shrink-0 mt-0.5">{t.removeBookmark}</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Response */}
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-amber-100 p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.myResponse}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.meditationLabel}</label>
                <textarea value={meditation} onChange={(e) => { setMeditation(e.target.value); setSaved(false); }}
                  placeholder={t.meditationPlaceholder} rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-amber-50/30 text-gray-800 placeholder-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 resize-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.applyLabel}</label>
                <textarea value={application} onChange={(e) => { setApplication(e.target.value); setSaved(false); }}
                  placeholder={t.applyPlaceholder} rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-amber-50/30 text-gray-800 placeholder-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 resize-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.prayerLabel}</label>
                <textarea value={prayer} onChange={(e) => { setPrayer(e.target.value); setSaved(false); }}
                  placeholder={t.prayerPlaceholder} rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-amber-50/30 text-gray-800 placeholder-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 resize-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.photoLabel}</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {photos.map((url, i) => (
                    <div key={i} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-amber-200">
                      <img src={url} alt={`photo-${i}`} className="w-full h-full object-cover" />
                      <button onClick={() => handleRemovePhoto(i)} className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">x</button>
                    </div>
                  ))}
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-amber-200 flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 transition-colors bg-amber-50/30">
                    {uploadingPhotos ? <span className="text-amber-400 text-xs">{t.uploading}</span> : (<>
                      <svg className="w-6 h-6 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                      <span className="text-amber-300 text-xs mt-0.5">{t.image}</span></>)}
                    <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-4 pt-2">
                <button onClick={handleSave}
                  disabled={saving || (!meditation.trim() && !application.trim() && !prayer.trim() && photos.length === 0)}
                  className="bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white text-sm font-medium py-2.5 px-6 rounded-xl transition-colors disabled:cursor-not-allowed">
                  {saving ? t.saving : saved ? t.saved : t.saveBtn}
                </button>
                {saved && (<>
                  <span className="text-green-600 text-sm">{t.saveSuccess}</span>
                  <button onClick={handleEdit} className="text-sm text-amber-600 hover:text-amber-800 transition-colors">{t.edit}</button>
                  <button onClick={handleDelete} disabled={deleting} className="text-sm text-red-500 hover:text-red-700 transition-colors disabled:opacity-50">{deleting ? t.deleting : t.delete}</button>
                </>)}
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          </div>

          {/* Community */}
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-amber-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t.community}</h3>
              <button onClick={loadCommunity} disabled={communityLoading} className="text-sm text-amber-600 hover:text-amber-800 transition-colors">
                {communityLoading ? t.loading : t.viewShares}
              </button>
            </div>
            {community.length === 0 && <p className="text-amber-500 text-sm">{t.loadHint}</p>}
            {community.map((item) => (
              <div key={item.id} className="border border-amber-100 rounded-xl overflow-hidden mb-2">
                <button onClick={() => setExpandedUser(expandedUser === item.id ? null : item.id)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-amber-50/50 hover:bg-amber-100/50 transition-colors">
                  <span className="font-medium text-gray-800 text-sm">{item.username || item.displayName || t.brotherSister}</span>
                  <svg className={`w-4 h-4 text-amber-400 transition-transform ${expandedUser === item.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {expandedUser === item.id && (
                  <div className="px-4 py-3 space-y-3 bg-white">
                    {item.meditation && <div><p className="text-xs font-medium text-amber-600 mb-1">{t.meditationLabel}</p><p className="text-sm text-gray-700 whitespace-pre-wrap">{item.meditation}</p></div>}
                    {item.application && <div><p className="text-xs font-medium text-amber-600 mb-1">{t.applyLabel}</p><p className="text-sm text-gray-700 whitespace-pre-wrap">{item.application}</p></div>}
                    {item.prayer && <div><p className="text-xs font-medium text-amber-600 mb-1">{t.prayerLabel}</p><p className="text-sm text-gray-700 whitespace-pre-wrap">{item.prayer}</p></div>}
                    {item.photos && item.photos.length > 0 && (
                      <div className="flex flex-wrap gap-2">{item.photos.map((url, i) => <img key={i} src={url} alt={`p-${i}`} className="w-24 h-24 object-cover rounded-xl border border-amber-100" />)}</div>
                    )}
                    <p className="text-xs text-amber-400">{new Date(item.createdAt).toLocaleString('zh-CN')}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>)}

        {/* Selection toolbar */}
        {selectionToolbar && (
          <div className="fixed z-[9999] flex items-center gap-0.5 bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.18)] border-2 border-amber-400 px-1.5 py-2 animate-[toolbarIn_0.2s_ease-out]"
            style={{ left: selectionToolbar.x, top: selectionToolbar.y, transform: 'translate(-50%, -100%)' }}
            onMouseDown={(e) => e.preventDefault()}>
            <button onClick={handleHighlight} className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100 rounded-lg transition-colors whitespace-nowrap">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              {t.highlight}
            </button>
            <button onClick={handleBookmark} className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-yellow-700 hover:bg-yellow-100 rounded-lg transition-colors whitespace-nowrap">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
              {t.bookmark}
            </button>
            <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              {t.copy}
            </button>
          </div>
        )}
        {copyFeedback && <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-gray-900 text-white text-sm px-5 py-2.5 rounded-full shadow-lg animate-[fadeInOut_1.5s_ease-in-out]">{t.copied}</div>}
      </div>

      <style jsx global>{`
        @keyframes toolbarIn { from { opacity: 0; transform: translate(-50%, -90%) scale(0.9); } to { opacity: 1; transform: translate(-50%, -100%) scale(1); } }
        @keyframes fadeInOut { 0% { opacity: 0; transform: translate(-50%, 10px); } 15% { opacity: 1; transform: translate(-50%, 0); } 85% { opacity: 1; transform: translate(-50%, 0); } 100% { opacity: 0; transform: translate(-50%, -10px); } }
      `}</style>
    </div>
  );
}
