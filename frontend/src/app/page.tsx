'use client';

import { useState, useRef } from 'react';
import api, { reflectionApi, praiseApi } from '@/services/api';

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

  // 随机播放赞美歌曲
  const [audioKey, setAudioKey] = useState(0);

  const playRandomPraise = async () => {
    setPraiseLoading(true);
    setError('');
    try {
      const res = await praiseApi.random();
      const track = res.data.data;
      setPraiseTrack(track);
      setAudioKey(prev => prev + 1); // 强制重新挂载audio元素
      setIsPlaying(true);
    } catch (err: any) {
      setError(err.response?.data?.message || '获取赞美歌曲失败');
    } finally {
      setPraiseLoading(false);
    }
  };

  const handleAudioCanPlay = () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => {});
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

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8">
      {/* 欢迎区域 */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-bible-dark mb-3">每日领受神的话语</h1>
        <p className="text-bible-muted text-lg">随机生成经文，安静默想，深度解经</p>
      </div>

      {/* 今日随想入口 */}
      <div className="text-center">
        <a
          href="/daily-thought"
          className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-bible-gold to-amber-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-amber-500 transform hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          今日随想
        </a>
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
              key={audioKey}
              ref={audioRef}
              src={praiseTrack.audioUrl}
              crossOrigin="anonymous"
              preload="auto"
              onCanPlay={handleAudioCanPlay}
              onEnded={() => setIsPlaying(false)}
              onError={() => {
                setError('音频加载失败，请尝试其他歌曲');
                setIsPlaying(false);
              }}
              className="hidden"
            />

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={togglePlay}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white flex items-center justify-center hover:from-amber-600 hover:to-yellow-600 transform hover:scale-110 active:scale-95 transition-all duration-200 shadow-md"
              >
                {isPlaying ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              <span className="text-sm text-bible-muted font-medium">
                {formatDuration(praiseTrack.durationSeconds)}
              </span>
            </div>
          </div>
        )}
      </div>
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