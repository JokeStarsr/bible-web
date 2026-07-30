'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { useI18n } from '@/i18n/I18nContext';
import { localizeScriptureReference, localizeBibleBookNames } from '@/utils/bibleBookNames';

interface QtContent {
  id: string;
  qtDate: string;
  title: string;
  scriptureReference: string;
  scriptureText: string;
  commentary: string;
  hymn?: string;
  titleKo?: string;
  scriptureReferenceKo?: string;
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

export default function QtSharePage() {
  const router = useRouter();
  const { t, lang } = useI18n();

  const [checkingAuth, setCheckingAuth] = useState(true);
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
    const token = localStorage.getItem('token');
    if (!token) {
      document.cookie = 'token=; path=/; max-age=0';
      document.cookie = 'refreshToken=; path=/; max-age=0';
      window.location.href = '/login';
      return;
    }
    setCheckingAuth(false);
    loadToday();
  }, []);

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
      setError(err.response?.data?.message || t('qt.noContent'));
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
      setError(err.response?.data?.message || t('qt.noContent'));
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
      setError(err.response?.data?.message || t('qt.saveFail'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!content || deleting) return;
    if (!confirm(t('qt.deleteConfirm'))) return;
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
      setError(err.response?.data?.message || t('qt.deleteFail'));
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
    const daysZh = [t('qt.sunday'), t('qt.monday'), t('qt.tuesday'), t('qt.wednesday'), t('qt.thursday'), t('qt.friday'), t('qt.saturday')];
    const d = new Date(dateStr);
    return daysZh[d.getDay()];
  };
  const getDayNumber = (dateStr: string) => new Date(dateStr).getDate();
  const getMonthDay = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}${t('qt.monthUnit')}${d.getDate()}${t('qt.dayUnit')}`;
  };

  // 经文渲染：韩文模式使用 scriptureTextKo（韩文+英文对照），中文模式使用 scriptureText（中文+英文对照）
  const renderScripture = () => {
    const text = (lang === 'ko' && content?.scriptureTextKo) ? content.scriptureTextKo : (content?.scriptureText || '');
    if (!text) return null;

    const lines = text.split('\n');
    return lines.map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={i} className="h-2"></div>;
      // 提取节号前缀（数字 + 空格），先于英文判断
      const verseMatch = trimmed.match(/^(\d+)\s+(.*)$/);
      const verseNum = verseMatch ? verseMatch[1] : null;
      const restText = verseMatch ? verseMatch[2] : trimmed;
      // 英文行：去除节号后以字母/引号/括号开头，且不含中文或韩文
      const isEnglish = /^[A-Za-z"(]/.test(restText) && !/[\u4e00-\u9fff\uac00-\ud7af]/.test(restText);
      return (
        <p key={i} className={
          isEnglish
            ? 'text-[13px] text-gray-400 italic leading-relaxed pl-4 border-l-2 border-amber-200 my-0.5'
            : 'text-[15px] text-gray-800 leading-relaxed'
        }>
          {verseNum && <span className="text-amber-600 font-bold mr-1.5">{verseNum}</span>}
          {restText}
        </p>
      );
    });
  };

  // 复制当日 QT 全文
  const handleCopyAll = async () => {
    if (!content) return;
    const title = lang === 'ko' && content.titleKo ? content.titleKo : localizeBibleBookNames(content.title, lang);
    const ref = lang === 'ko' && content.scriptureReferenceKo ? content.scriptureReferenceKo : localizeScriptureReference(content.scriptureReference, lang);
    const scripture = (lang === 'ko' && content.scriptureTextKo) ? content.scriptureTextKo : (content.scriptureText || '');
    const parts = [
      `${getMonthDay(content.qtDate)} ${getDayOfWeek(content.qtDate)}`,
      title,
      ref,
      '',
      scripture,
      '',
      commentaryText,
      '',
      hymnText,
    ].filter(p => p !== '');
    const fullText = parts.join('\n');
    try {
      await navigator.clipboard.writeText(fullText);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 1500);
    } catch {
      try { document.execCommand('copy'); } catch { /* ignore */ }
    }
  };

  if (checkingAuth) {
    return <div className="min-h-screen flex items-center justify-center bg-[#FDF8F0]">
      <div className="text-amber-700 text-lg animate-pulse">{t('qt.checkingAuth')}</div>
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
            {t('qt.back')}
          </button>
          <span className="text-amber-900 font-medium text-sm">{t('qt.qtTitle')}</span>
          <button onClick={() => router.push('/qt-share/history')} className="text-amber-700 hover:text-amber-900 transition-colors text-sm">{t('qt.history')}</button>
        </div>
        {/* Date picker row */}
        <div className="max-w-2xl mx-auto px-4 py-2 flex items-center gap-2 flex-wrap">
          <label className="text-xs text-amber-600 font-medium">{t('qt.selectDate')}</label>
          <select
            value={pickerYear}
            onChange={(e) => setPickerYear(parseInt(e.target.value))}
            className="text-sm px-2 py-1.5 rounded-lg border border-amber-200 bg-white text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
          >
            {years.map(y => <option key={y} value={y}>{y}{t('qt.yearUnit')}</option>)}
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
            {months.map(m => <option key={m} value={m}>{m}{t('qt.monthUnit')}</option>)}
          </select>
          <select
            value={pickerDay}
            onChange={(e) => setPickerDay(parseInt(e.target.value))}
            className="text-sm px-2 py-1.5 rounded-lg border border-amber-200 bg-white text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
          >
            {getDays().map(d => <option key={d} value={d}>{d}{t('qt.dayUnit')}</option>)}
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
          >{t('qt.confirm')}</button>
          {selectedDate !== getTodayStr() && (
            <button
              onClick={() => {
                const tdy = getTodayStr();
                setSelectedDate(tdy);
                syncPickerFromDate(tdy);
                loadToday();
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
            >{t('qt.goToday')}</button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-16">
        {loading && <div className="text-center py-20"><div className="text-amber-700 text-lg animate-pulse">{t('qt.loadingContent')}</div></div>}
        {error && !content && <div className="text-center py-20"><p className="text-amber-800 text-lg mb-4">{error}</p><p className="text-amber-600">{t('qt.contactAdmin')}</p></div>}

        {content && (<>
          {/* QT Content Card */}
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
            {/* Tag bar */}
            <div className="flex items-center justify-between px-5 py-3 bg-amber-50/50 border-b border-amber-100">
              <div className="flex items-center gap-3">
                <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded">{t('qt.meditationEssay')}</span>
                <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded">{t('qt.scriptureExplain')}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyAll}
                  className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-1 rounded transition-colors"
                  title={t('qt.copyAll')}
                >
                  {copyFeedback ? (
                    <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  )}
                  {copyFeedback ? t('qt.copied') : t('qt.copyAll')}
                </button>
                {hymnText && <span className="text-xs text-amber-500">{hymnText.split('\n')[0].trim()}</span>}
              </div>
            </div>

            {/* Date + Title */}
            <div className="px-5 pt-5 pb-3">
              <div className="flex items-baseline gap-2 text-amber-500 text-sm mb-1">
                <span>{getDayOfWeek(content.qtDate)}</span>
                <span className="text-3xl font-bold text-amber-800">{getDayNumber(content.qtDate)}</span>
                <span className="text-xs text-amber-400">{getMonthDay(content.qtDate)}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">{lang === 'ko' && content.titleKo ? content.titleKo : localizeBibleBookNames(content.title, lang)}</h1>
              {content.scriptureReference && <p className="text-amber-700 font-medium text-sm mt-1">{lang === 'ko' && content.scriptureReferenceKo ? content.scriptureReferenceKo : localizeScriptureReference(content.scriptureReference, lang)}</p>}
            </div>

            <div className="border-t border-amber-100"></div>

            {/* Scripture */}
            <div className="px-5 py-4" onMouseUp={handleMouseUp} onContextMenu={handleContextMenu} onTouchEnd={handleMouseUp}>
              <h3 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-amber-400 rounded-full"></span>{t('qt.scripture')}
              </h3>
              <div className="selection:bg-amber-200/60">{renderScripture()}</div>
            </div>

            {/* Commentary */}
            {commentaryText && (<>
              <div className="border-t border-amber-100"></div>
              <div className="px-5 py-4" onMouseUp={handleMouseUp} onContextMenu={handleContextMenu} onTouchEnd={handleMouseUp}>
                <h3 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 bg-amber-400 rounded-full"></span>{t('qt.meditation')}
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
                  {t('qt.todayHymn')}
                </h3>
                <div className="text-rose-800 leading-relaxed text-[15px] whitespace-pre-wrap italic">{hymnText}</div>
              </div>
            </>)}
          </div>

          {/* Bookmarks */}
          {bookmarks.length > 0 && (
            <div className="mt-4 bg-white rounded-xl shadow-sm border border-amber-200 p-4">
              <p className="text-sm font-medium text-amber-800 mb-2 flex items-center gap-1"><span>⭐</span> {t('qt.myBookmarks')}</p>
              <div className="space-y-1.5">
                {bookmarks.map((bm, i) => (
                  <div key={i} className="flex items-start justify-between gap-2 text-sm">
                    <p className="text-gray-700 flex-1 leading-relaxed">{bm}</p>
                    <button onClick={() => handleRemoveBookmark(i)} className="text-amber-400 hover:text-red-500 text-xs shrink-0 mt-0.5">{t('qt.removeBookmark')}</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Response */}
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-amber-100 p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('qt.myResponse')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('qt.meditationLabel')}</label>
                <textarea value={meditation} onChange={(e) => { setMeditation(e.target.value); setSaved(false); }}
                  placeholder={t('qt.meditationPlaceholder')} rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-amber-50/30 text-gray-800 placeholder-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 resize-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('qt.applyLabel')}</label>
                <textarea value={application} onChange={(e) => { setApplication(e.target.value); setSaved(false); }}
                  placeholder={t('qt.applyPlaceholder')} rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-amber-50/30 text-gray-800 placeholder-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 resize-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('qt.prayerLabel')}</label>
                <textarea value={prayer} onChange={(e) => { setPrayer(e.target.value); setSaved(false); }}
                  placeholder={t('qt.prayerPlaceholder')} rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-amber-50/30 text-gray-800 placeholder-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 resize-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('qt.photoLabel')}</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {photos.map((url, i) => (
                    <div key={i} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-amber-200">
                      <img src={url} alt={`photo-${i}`} className="w-full h-full object-cover" />
                      <button onClick={() => handleRemovePhoto(i)} className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">x</button>
                    </div>
                  ))}
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-amber-200 flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 transition-colors bg-amber-50/30">
                    {uploadingPhotos ? <span className="text-amber-400 text-xs">{t('qt.uploading')}</span> : (<>
                      <svg className="w-6 h-6 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                      <span className="text-amber-300 text-xs mt-0.5">{t('qt.image')}</span></>)}
                    <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-4 pt-2">
                <button onClick={handleSave}
                  disabled={saving || (!meditation.trim() && !application.trim() && !prayer.trim() && photos.length === 0)}
                  className="bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white text-sm font-medium py-2.5 px-6 rounded-xl transition-colors disabled:cursor-not-allowed">
                  {saving ? t('qt.saving') : saved ? t('qt.saved') : t('qt.saveBtn')}
                </button>
                {saved && (<>
                  <span className="text-green-600 text-sm">{t('qt.saveSuccess')}</span>
                  <button onClick={handleEdit} className="text-sm text-amber-600 hover:text-amber-800 transition-colors">{t('qt.edit')}</button>
                  <button onClick={handleDelete} disabled={deleting} className="text-sm text-red-500 hover:text-red-700 transition-colors disabled:opacity-50">{deleting ? t('qt.deleting') : t('qt.delete')}</button>
                </>)}
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          </div>

          {/* Community */}
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-amber-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('qt.community')}</h3>
              <button onClick={loadCommunity} disabled={communityLoading} className="text-sm text-amber-600 hover:text-amber-800 transition-colors">
                {communityLoading ? t('qt.loading') : t('qt.viewShares')}
              </button>
            </div>
            {community.length === 0 && <p className="text-amber-500 text-sm">{t('qt.loadHint')}</p>}
            {community.map((item) => (
              <div key={item.id} className="border border-amber-100 rounded-xl overflow-hidden mb-2">
                <button onClick={() => setExpandedUser(expandedUser === item.id ? null : item.id)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-amber-50/50 hover:bg-amber-100/50 transition-colors">
                  <span className="font-medium text-gray-800 text-sm">{item.username || item.displayName || t('qt.brotherSister')}</span>
                  <svg className={`w-4 h-4 text-amber-400 transition-transform ${expandedUser === item.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {expandedUser === item.id && (
                  <div className="px-4 py-3 space-y-3 bg-white">
                    {item.meditation && <div><p className="text-xs font-medium text-amber-600 mb-1">{t('qt.meditationLabel')}</p><p className="text-sm text-gray-700 whitespace-pre-wrap">{item.meditation}</p></div>}
                    {item.application && <div><p className="text-xs font-medium text-amber-600 mb-1">{t('qt.applyLabel')}</p><p className="text-sm text-gray-700 whitespace-pre-wrap">{item.application}</p></div>}
                    {item.prayer && <div><p className="text-xs font-medium text-amber-600 mb-1">{t('qt.prayerLabel')}</p><p className="text-sm text-gray-700 whitespace-pre-wrap">{item.prayer}</p></div>}
                    {item.photos && item.photos.length > 0 && (
                      <div className="flex flex-wrap gap-2">{item.photos.map((url, i) => <img key={i} src={url} alt={`p-${i}`} className="w-24 h-24 object-cover rounded-xl border border-amber-100" />)}</div>
                    )}
                    <p className="text-xs text-amber-400">{new Date(item.createdAt).toLocaleString(lang === 'ko' ? 'ko-KR' : 'zh-CN')}</p>
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
              {t('qt.highlight')}
            </button>
            <button onClick={handleBookmark} className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-yellow-700 hover:bg-yellow-100 rounded-lg transition-colors whitespace-nowrap">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
              {t('qt.bookmark')}
            </button>
            <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              {t('qt.copy')}
            </button>
          </div>
        )}
        {copyFeedback && <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-gray-900 text-white text-sm px-5 py-2.5 rounded-full shadow-lg animate-[fadeInOut_1.5s_ease-in-out]">{t('qt.copied')}</div>}
      </div>

      <style jsx global>{`
        @keyframes toolbarIn { from { opacity: 0; transform: translate(-50%, -90%) scale(0.9); } to { opacity: 1; transform: translate(-50%, -100%) scale(1); } }
        @keyframes fadeInOut { 0% { opacity: 0; transform: translate(-50%, 10px); } 15% { opacity: 1; transform: translate(-50%, 0); } 85% { opacity: 1; transform: translate(-50%, 0); } 100% { opacity: 0; transform: translate(-50%, -10px); } }
      `}</style>
    </div>
  );
}
