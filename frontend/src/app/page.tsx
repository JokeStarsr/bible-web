'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api, { reflectionApi, praiseApi, contactApi } from '@/services/api';
import HebrewText from '@/components/HebrewText';
import ScriptureReader from '@/components/ScriptureReader';

// 从导航栏点击“联系牧者”时自动打开弹窗
function ContactModalOpener({
  onOpen,
}: {
  onOpen: () => void;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get('contact') === 'open') {
      onOpen();
      router.replace('/', { scroll: false });
    }
  }, [searchParams, router, onOpen]);

  return null;
}

const generationOptions = [
  { type: 'verse_1', label: '1节' },
  { type: 'verse_7', label: '7节' },
  { type: 'verse_12', label: '12节' },
  { type: 'verse_27', label: '27节' },
  { type: 'verse_39', label: '39节' },
  { type: 'chapter_full', label: '整一章' },
];

interface VerseItem {
  versionId: string;
  bookId: string;
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
  audioUrl?: string;
  durationSeconds: number;
  lyrics?: string;
  externalUrl?: string;
  sourceType?: string;
}

export default function HomePage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
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

  // 切换歌曲后自动加载并播放（仅对本地可播放音频；外链曲目只展示信息）
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !praiseTrack) return;
    setCurrentTime(0);
    setDuration(praiseTrack.durationSeconds || 0);
    setIsPlaying(false);
    if (praiseTrack.sourceType === 'external_link' || !praiseTrack.audioUrl) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      return;
    }
    audio.pause();
    audio.src = `/api/v1/praise/stream/${praiseTrack.id}`;
    audio.load();
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => {
          // 浏览器可能阻止自动播放，等待用户点击
          setIsPlaying(false);
        });
    }
    return () => {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    };
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
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        if (userInfo.id) setCurrentUserId(userInfo.id);
      } catch {
        // ignore
      }
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
    <div className="space-y-6">
      <Suspense fallback={null}>
        <ContactModalOpener
          onOpen={() => {
            setShowContactModal(true);
            setContactSuccess('');
            setError('');
          }}
        />
      </Suspense>

      {/* 欢迎区域 */}
      <div className="text-center pt-4 pb-6">
        <h1 className="text-2xl font-bold text-bible-dark mb-1">每日领受神的话语</h1>
        <p className="text-bible-muted text-sm">随机生成经文，安静默想，深度解经</p>
      </div>

      {/* 功能入口卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <a
          href="/daily-thought"
          className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100 text-amber-800 hover:bg-amber-100 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-sm">今日随想</p>
            <p className="text-xs text-amber-700/70">记录灵修感动</p>
          </div>
        </a>
        <a
          href="/maps"
          className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-800 hover:bg-indigo-100 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-sm">圣经地图</p>
            <p className="text-xs text-indigo-700/70">探索圣经历史路线</p>
          </div>
        </a>
        <button
          onClick={() => {
            setShowContactModal(true);
            setContactSuccess('');
            setError('');
          }}
          className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 hover:bg-emerald-100 transition-colors text-left w-full"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-sm">联系牧者</p>
            <p className="text-xs text-emerald-700/70">寻求牧养帮助</p>
          </div>
        </button>
      </div>

      {/* 生成按钮组 */}
      <div className="flex flex-wrap justify-center gap-2">
        {generationOptions.map((opt) => (
          <button
            key={opt.type}
            onClick={() => generateScripture(opt.type)}
            disabled={loading}
            className="px-4 py-2 text-sm border border-bible-warm rounded-lg text-bible-dark bg-white hover:border-bible-gold hover:text-bible-gold transition-colors"
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
          <ScriptureReader scripture={scripture} currentUserId={currentUserId} />

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

          <Section title="经文摘要">
            <HebrewText text={exegesis.summary} />
          </Section>
          {exegesis.originalTextNote && (
            <Section title="原文翻译与注释">
              <HebrewText text={exegesis.originalTextNote} />
            </Section>
          )}
          {exegesis.verseByVerse && (
            <Section title="逐节解析">
              <HebrewText text={exegesis.verseByVerse} />
            </Section>
          )}
          <Section title="历史背景">
            <HebrewText text={exegesis.historicalBackground} />
          </Section>
          <Section title="写作背景">
            <HebrewText text={exegesis.writingBackground} />
          </Section>
          <Section title="上下文关系">
            <HebrewText text={exegesis.contextAnalysis} />
          </Section>

          {exegesis.keywordAnalysis?.length > 0 && (
            <Section title="关键词解析">
              <ul className="space-y-2">
                {exegesis.keywordAnalysis.map((kw: any, i: number) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-bible-gold font-semibold min-w-[4rem]">
                      <HebrewText text={kw.keyword} />：
                    </span>
                    <span>
                      <HebrewText text={kw.explanation} />
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section title="在整本圣经中的位置">
            <HebrewText text={exegesis.canonicalPosition} />
          </Section>
          <Section title="神学主题">
            <HebrewText text={exegesis.theologicalTheme} />
          </Section>
          <Section title="神对世人的启示" highlight>
            <HebrewText text={exegesis.truthForPeople} />
          </Section>
          <Section title="对当代信徒的提醒">
            <HebrewText text={exegesis.practicalApplication} />
          </Section>
        </div>
      )}

      {/* ==================== 灵修记录 ==================== */}
      {scripture && (
        <div className="scripture-card space-y-4">
          <h2 className="text-xl font-bold text-bible-dark text-center border-b border-bible-warm pb-3">
            写下你的感悟
          </h2>
          {reflectionSaved ? (
            <div className="text-center text-green-600 bg-green-50 rounded-lg py-4 space-y-2">
              <p className="font-semibold">感悟已保存 ✅</p>
              <p className="text-sm">你可以在个人中心查看你的灵修记录</p>
              <a
                href="/profile"
                className="inline-flex items-center gap-1 text-sm text-bible-gold hover:text-amber-600 font-semibold transition-colors"
              >
                前往个人中心
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
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
      <div className="scripture-card space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-bible-dark flex items-center gap-2">
            <span>🎵</span> 赞美诗歌
          </h2>
          <button
            onClick={playRandomPraise}
            disabled={praiseLoading}
            className="text-sm px-3 py-1.5 rounded-full bg-bible-gold/10 text-bible-gold hover:bg-bible-gold/20 transition-colors disabled:opacity-50"
          >
            {praiseLoading ? '加载中...' : praiseTrack ? '换一首' : '随机播放'}
          </button>
        </div>

        {praiseTrack && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <p className="flex-1 text-sm">
                <span className="font-semibold text-bible-dark">{praiseTrack.title}</span>
                <span className="text-bible-muted ml-2">{praiseTrack.artistName}</span>
              </p>
            </div>

            {praiseTrack.sourceType === 'external_link' || !praiseTrack.audioUrl ? (
              <div className="space-y-2">
                {praiseTrack.lyrics && (
                  <div className="max-h-32 overflow-y-auto text-sm text-bible-dark whitespace-pre-line bg-bible-cream rounded-lg p-3 leading-relaxed">
                    {praiseTrack.lyrics}
                  </div>
                )}
                <a
                  href={praiseTrack.externalUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-bible-gold hover:text-amber-600 font-medium"
                >
                  去官方平台收听
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            ) : (
              <div className="space-y-2">
                <audio
                  ref={audioRef}
                  preload="auto"
                  onCanPlay={handleAudioCanPlay}
                  onLoadedMetadata={handleLoadedMetadata}
                  onTimeUpdate={handleTimeUpdate}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  onError={() => {
                    setError('音频加载失败，请尝试其他歌曲');
                    setIsPlaying(false);
                  }}
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="w-9 h-9 rounded-full bg-bible-gold text-white flex items-center justify-center hover:bg-amber-600 transition-colors flex-shrink-0"
                  >
                    {isPlaying ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
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
                      className="w-full h-1.5 bg-bible-warm rounded-lg appearance-none cursor-pointer accent-bible-gold"
                    />
                    <div className="flex justify-between text-xs text-bible-muted mt-1">
                      <span>{formatDuration(currentTime)}</span>
                      <span>{formatDuration(duration || praiseTrack.durationSeconds)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
      <div className="text-bible-text leading-relaxed whitespace-pre-wrap">{children}</div>
    </div>
  );
}