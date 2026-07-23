'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api, { reflectionApi, praiseApi, contactApi } from '@/services/api';

const generationOptions = [
  { type: 'verse_1', label: '1节' },
  { type: 'verse_7', label: '7节' },
  { type: 'verse_12', label: '12节' },
  { type: 'verse_27', label: '27节' },
  { type: 'verse_39', label: '39节' },
  { type: 'chapter_full', label: '整一章' },
];

interface VerseItem {
  bookName: string;
  chapterNumber: number;
  verseNumber: number;
  text: string;
}

interface ScriptureData {
  generationRecordId: string;
  referenceText: string;
  generationType: string;
  verses: VerseItem[];
}

interface PraiseTrack {
  id: string;
  title: string;
  artistName: string;
  coverImageUrl: string | null;
  audioUrl: string;
  durationSeconds: number;
}

export default function HomePage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [scripture, setScripture] = useState<ScriptureData | null>(null);
  const [exegesis, setExegesis] = useState<any>(null);
  const [error, setError] = useState('');

  // 灵修记录
  const [reflectionTitle, setReflectionTitle] = useState('');
  const [reflectionContent, setReflectionContent] = useState('');
  const [reflectionSaving, setReflectionSaving] = useState(false);
  const [reflectionSaved, setReflectionSaved] = useState(false);

  // 赞美歌曲
  const [praiseTrack, setPraiseTrack] = useState<PraiseTrack | null>(null);
  const [praiseLoading, setPraiseLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // 切换歌曲后自动加载并播放（通过后端代理，避免外联音频跨域/加载失败）
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !praiseTrack) return;
    audio.pause();
    audio.src = `/api/v1/praise/stream/${praiseTrack.id}`;
    audio.load();
    setCurrentTime(0);
    setDuration(praiseTrack.durationSeconds || 0);
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => {
          // 浏览器可能阻止自动播放，等待用户点击
          setIsPlaying(false);
        });
    }
  }, [praiseTrack]);

  // 联系牧者
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    gender: '男',
    wechatName: '',
    phone: '',
    email: '',
    location: '',
  });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState('');

  // 客户端登录保护：未登录则清除可能残留的 Cookie 并跳转到登录页
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      document.cookie = 'token=; path=/; max-age=0';
      document.cookie = 'refreshToken=; path=/; max-age=0';
      window.location.href = '/login';
    } else {
      setCheckingAuth(false);
    }
  }, []);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-bible-gold text-lg animate-pulse">正在确认登录状态...</div>
      </div>
    );
  }

  const generateScripture = async (type: string) => {
    setLoading(true);
    setError('');
    setExegesis(null);
    setReflectionSaved(false);
    setReflectionContent('');
    setReflectionTitle('');
    try {
      const res = await api.post('/scriptures/generate', {
        generationType: type,
      });
      setScripture(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || '生成失败，请先登录');
    } finally {
      setLoading(false);
    }
  };

  const getExegesis = async () => {
    if (!scripture) return;
    setLoading(true);
    try {
      const res = await api.post('/exegesis/generate', {
        generationRecordId: scripture.generationRecordId,
      });
      setExegesis(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || '获取解经失败');
    } finally {
      setLoading(false);
    }
  };

  // 保存灵修记录
  const saveReflection = async () => {
    if (!scripture || !reflectionContent.trim()) return;
    setReflectionSaving(true);
    setError('');
    try {
      await reflectionApi.create({
        generationRecordId: scripture.generationRecordId,
        referenceText: scripture.referenceText,
        title: reflectionTitle.trim() || undefined,
        content: reflectionContent.trim(),
        visibility: 'private',
      });
      setReflectionSaved(true);
    } catch (err: any) {
      setError(err.response?.data?.message || '保存失败');
    } finally {
      setReflectionSaving(false);
    }
  };

  // 提交联系牧者表单
  const submitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (contactSubmitting) return;
    setContactSubmitting(true);
    setError('');
    setContactSuccess('');
    try {
      const res = await contactApi.contactPastor({
        name: contactForm.name.trim(),
        gender: contactForm.gender,
        wechatName: contactForm.wechatName.trim() || undefined,
        phone: contactForm.phone.trim() || undefined,
        email: contactForm.email.trim(),
        location: contactForm.location.trim(),
      });
      setContactSuccess(res.data?.message || '您的信息已提交至刘牧师处，晚些时候会跟您联系，请保持以上通讯方式畅通。');
      setContactForm({ name: '', gender: '男', wechatName: '', phone: '', email: '', location: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || '提交失败，请稍后再试');
    } finally {
      setContactSubmitting(false);
    }
  };

  // 随机播放赞美歌曲
  const playRandomPraise = async () => {
    setPraiseLoading(true);
    setError('');
    try {
      const res = await praiseApi.random();
      const track = res.data.data;
      setPraiseTrack(track);
    } catch (err: any) {
      setError(err.response?.data?.message || '获取赞美歌曲失败');
    } finally {
      setPraiseLoading(false);
    }
  };

  const handleAudioCanPlay = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && !isDragging) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || duration);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeekStart = () => {
    setIsDragging(true);
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setCurrentTime(value);
  };

  const handleSeekEnd = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    const value = parseFloat((e.target as HTMLInputElement).value);
    setIsDragging(false);
    if (audioRef.current) {
      audioRef.current.currentTime = value;
    }
  };

  const formatDuration = (seconds: number) => {
    if (!isFinite(seconds) || seconds < 0) seconds = 0;
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8">
      {/* 欢迎区域 */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-bible-dark mb-3">每日领受神的话语</h1>
        <p className="text-bible-muted text-lg">随机生成经文，安静默想，深度解经</p>
      </div>

      {/* 今日随想入口与联系牧者 */}
      <div className="flex flex-wrap justify-center gap-4">
        <a
          href="/daily-thought"
          className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-bible-gold to-amber-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-amber-500 transform hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          今日随想
        </a>
        <button
          onClick={() => {
            setShowContactModal(true);
            setContactSuccess('');
            setError('');
          }}
          className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-teal-600 transform hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          联系牧者
        </button>
      </div>

      {/* 生成按钮组 */}
      <div className="flex flex-wrap justify-center gap-3">
        {generationOptions.map((opt) => (
          <button
            key={opt.type}
            onClick={() => generateScripture(opt.type)}
            disabled={loading}
            className="btn-secondary hover:border-bible-gold hover:text-bible-gold transition-all"
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="text-center text-red-500 bg-red-50 rounded-lg py-3 px-4">
          {error}
        </div>
      )}

      {/* 加载状态 */}
      {loading && (
        <div className="text-center text-bible-muted py-8">
          <div className="animate-pulse">正在生成经文...</div>
        </div>
      )}

      {/* 经文展示 */}
      {scripture && (
        <div className="space-y-6">
          <div className="scripture-card">
            <div className="text-center text-bible-gold text-sm font-semibold mb-4 tracking-wider">
              {scripture.referenceText}
            </div>
            <div className="verse-text space-y-3">
              {scripture.verses.map((v, i) => (
                <p key={i}>
                  <sup className="verse-number">{v.verseNumber}</sup>
                  {v.text}
                </p>
              ))}
            </div>
          </div>

          {/* 解经按钮 */}
          <div className="text-center">
            <button onClick={getExegesis} className="exegesis-btn" disabled={loading}>
              开始解经
            </button>
          </div>
        </div>
      )}

      {/* 解经内容 */}
      {exegesis && (
        <div className="scripture-card space-y-6">
          <h2 className="text-2xl font-bold text-bible-dark text-center border-b border-bible-warm pb-4">
            精读解经
          </h2>

          <Section title="经文摘要">{exegesis.summary}</Section>
          {exegesis.originalTextNote && (
            <Section title="原文翻译与注释">{exegesis.originalTextNote}</Section>
          )}
          {exegesis.verseByVerse && (
            <Section title="逐节解析">{exegesis.verseByVerse}</Section>
          )}
          <Section title="历史背景">{exegesis.historicalBackground}</Section>
          <Section title="写作背景">{exegesis.writingBackground}</Section>
          <Section title="上下文关系">{exegesis.contextAnalysis}</Section>

          {exegesis.keywordAnalysis?.length > 0 && (
            <Section title="关键词解析">
              <ul className="space-y-2">
                {exegesis.keywordAnalysis.map((kw: any, i: number) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-bible-gold font-semibold min-w-[4rem]">{kw.keyword}：</span>
                    <span>{kw.explanation}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section title="在整本圣经中的位置">{exegesis.canonicalPosition}</Section>
          <Section title="神学主题">{exegesis.theologicalTheme}</Section>
          <Section title="神对世人的启示" highlight>{exegesis.truthForPeople}</Section>
          <Section title="对当代信徒的提醒">{exegesis.practicalApplication}</Section>
        </div>
      )}

      {/* ==================== 灵修记录 ==================== */}
      {scripture && (
        <div className="scripture-card space-y-4">
          <h2 className="text-xl font-bold text-bible-dark text-center border-b border-bible-warm pb-3">
            写下你的感悟
          </h2>
          {reflectionSaved ? (
            <div className="text-center text-green-600 bg-green-50 rounded-lg py-4">
              <p className="font-semibold">感悟已保存 ✅</p>
              <p className="text-sm mt-1">你可以在个人中心查看你的灵修记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="标题（选填）"
                value={reflectionTitle}
                onChange={(e) => setReflectionTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-bible-gold"
              />
              <textarea
                placeholder="分享你对这段经文的感动、理解和应用..."
                value={reflectionContent}
                onChange={(e) => setReflectionContent(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-bible-gold resize-none"
              />
              <div className="text-center">
                <button
                  onClick={saveReflection}
                  disabled={reflectionSaving || !reflectionContent.trim()}
                  className="exegesis-btn disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {reflectionSaving ? '保存中...' : '保存感悟'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== 赞美播放 ==================== */}
      <div className="scripture-card space-y-4 bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200">
        <h2 className="text-xl font-bold text-bible-dark text-center border-b border-amber-200 pb-3 flex items-center justify-center gap-2">
          <span className="text-2xl">🎵</span> 赞美诗歌
        </h2>
        <div className="text-center">
          <button
            onClick={playRandomPraise}
            disabled={praiseLoading}
            className="group relative inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl hover:from-amber-600 hover:via-yellow-600 hover:to-amber-500 transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {praiseLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                加载中...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
                <span>{praiseTrack ? '换一首赞美诗' : '🎶 随机播放赞美诗歌'}</span>
                <svg className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            )}
          </button>
        </div>

        {praiseTrack && (
          <div className="bg-white/80 backdrop-blur rounded-xl p-6 space-y-4 shadow-inner">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-amber-400 to-yellow-300 flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
              <p className="text-xl font-bold text-bible-dark">{praiseTrack.title}</p>
              <p className="text-sm text-bible-muted mt-1">{praiseTrack.artistName}</p>
            </div>

            <audio
              ref={audioRef}
              preload="auto"
              onCanPlay={handleAudioCanPlay}
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              onError={() => {
                setError('音频加载失败，请尝试其他歌曲');
                setIsPlaying(false);
              }}
              className="hidden"
            />

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white flex items-center justify-center hover:from-amber-600 hover:to-yellow-600 transform hover:scale-110 active:scale-95 transition-all duration-200 shadow-md flex-shrink-0"
                >
                  {isPlaying ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
                <div className="flex-1">
                  <input
                    type="range"
                    min={0}
                    max={duration || 1}
                    step={0.1}
                    value={currentTime}
                    onMouseDown={handleSeekStart}
                    onTouchStart={handleSeekStart}
                    onChange={handleSeekChange}
                    onMouseUp={handleSeekEnd}
                    onTouchEnd={handleSeekEnd}
                    className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-600"
                  />
                  <div className="flex justify-between text-xs text-bible-muted mt-1">
                    <span>{formatDuration(currentTime)}</span>
                    <span>{formatDuration(duration || praiseTrack.durationSeconds)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 联系牧者弹窗 */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-bible-dark">联系牧者</h2>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="text-bible-muted hover:text-bible-dark"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {contactSuccess ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-green-700 font-medium">{contactSuccess}</p>
                  <button
                    onClick={() => {
                      setShowContactModal(false);
                      setContactSuccess('');
                    }}
                    className="btn-primary"
                  >
                    好的
                  </button>
                </div>
              ) : (
                <form onSubmit={submitContact} className="space-y-4">
                  <div>
                    <label className="block text-sm text-bible-muted mb-1">姓名（可化名）</label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                      placeholder="请输入姓名或化名"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-bible-muted mb-1">性别</label>
                    <select
                      value={contactForm.gender}
                      onChange={(e) => setContactForm({ ...contactForm, gender: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                    >
                      <option value="男">男</option>
                      <option value="女">女</option>
                      <option value="其他">其他</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-bible-muted mb-1">微信名</label>
                    <input
                      type="text"
                      value={contactForm.wechatName}
                      onChange={(e) => setContactForm({ ...contactForm, wechatName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                      placeholder="请输入微信名"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-bible-muted mb-1">手机号</label>
                    <input
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                      placeholder="请输入手机号"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-bible-muted mb-1">邮箱</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                      placeholder="请输入邮箱"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-bible-muted mb-1">当前居住地</label>
                    <input
                      type="text"
                      value={contactForm.location}
                      onChange={(e) => setContactForm({ ...contactForm, location: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                      placeholder="请输入当前居住地"
                    />
                  </div>

                  {error && (
                    <div className="text-red-500 text-sm bg-red-50 rounded-lg py-2 px-3">{error}</div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={contactSubmitting}
                      className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-lg shadow hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {contactSubmitting ? '提交中...' : '提交'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children, highlight }: { title: string; children: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={highlight ? 'bg-yellow-50/50 border border-yellow-200 rounded-lg p-4' : ''}>
      <h3 className="text-lg font-bold text-bible-dark mb-2">{title}</h3>
      <div className="text-bible-text leading-relaxed">{children}</div>
    </div>
  );
}