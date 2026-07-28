'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';

// 希伯来文 Unicode 范围：基本希伯来文 + 字母呈现形式-A
const HEBREW_REGEX = /[\u0590-\u05FF\uFB1D-\uFB4F]+/g;
// 希腊文 Unicode 范围：Greek and Coptic + Greek Extended
const GREEK_REGEX = /[\u0370-\u03FF\u1F00-\u1FFF]+/g;
// 联合匹配
const ANCIENT_REGEX = /[\u0370-\u03FF\u1F00-\u1FFF\u0590-\u05FF\uFB1D-\uFB4F]+/g;

// ========== 希伯来语音译 ==========

const HEBREW_VOWEL_MAP: Record<string, string> = {
  '\u05B0': 'e', '\u05B1': 'e', '\u05B2': 'a', '\u05B3': 'o',
  '\u05B4': 'i', '\u05B5': 'e', '\u05B6': 'e', '\u05B7': 'a',
  '\u05B8': 'a', '\u05B9': 'o', '\u05BA': 'o', '\u05BB': 'u',
};

const HEBREW_IGNORED = new Set([
  '\u05BC', '\u05BD', '\u05BF', '\u05C0', '\u05C3', '\u05C4', '\u05C5', '\u05C6', '\u05C7',
  ...Array.from({ length: 31 }, (_, i) => String.fromCharCode(0x0591 + i)),
]);

const HEBREW_DAGESH: Record<string, string> = { 'ב': 'b', 'כ': 'k', 'ך': 'k', 'פ': 'p' };

const HEBREW_CONSONANT: Record<string, string> = {
  'א': '', 'ב': 'v', 'ג': 'g', 'ד': 'd', 'ה': 'h', 'ו': 'v',
  'ז': 'z', 'ח': 'ch', 'ט': 't', 'י': 'y', 'כ': 'ch', 'ך': 'ch',
  'ל': 'l', 'מ': 'm', 'ם': 'm', 'נ': 'n', 'ן': 'n', 'ס': 's',
  'ע': '', 'פ': 'f', 'ף': 'f', 'ץ': 'ts', 'צ': 'ts', 'ק': 'k',
  'ר': 'r', 'ש': 'sh', 'ת': 't',
};

function isHebrewMark(ch: string): boolean {
  const cp = ch.codePointAt(0) || 0;
  return (cp >= 0x0591 && cp <= 0x05af) || (cp >= 0x05b0 && cp <= 0x05bc) ||
         (cp >= 0x05bd && cp <= 0x05c0) || (cp >= 0x05c3 && cp <= 0x05c7);
}

function peekShinDot(normalized: string, startIndex: number): { sound: 'sh' | 's'; index: number } | null {
  let j = startIndex;
  while (j < normalized.length) {
    const ch = normalized[j];
    if (ch === '\u05C1') return { sound: 'sh', index: j };
    if (ch === '\u05C2') return { sound: 's', index: j };
    if (!isHebrewMark(ch)) break;
    j++;
  }
  return null;
}

function transliterateHebrew(word: string): string {
  const normalized = word.normalize('NFD');
  let result = '';
  let i = 0;
  const skip = new Set<number>();

  while (i < normalized.length) {
    if (skip.has(i)) { i++; continue; }
    const cp = normalized.codePointAt(i);
    if (cp === undefined) break;
    const ch = String.fromCodePoint(cp);
    const len = cp > 0xFFFF ? 2 : 1;

    if (HEBREW_IGNORED.has(ch)) { i += len; continue; }
    if (HEBREW_VOWEL_MAP[ch]) { result += HEBREW_VOWEL_MAP[ch]; i += len; continue; }

    if (ch === 'ש') {
      const dot = peekShinDot(normalized, i + len);
      if (dot) { result += dot.sound; skip.add(dot.index); }
      else result += 'sh';
      i += len; continue;
    }

    if (ch === 'ו') {
      const next = normalized[i + len];
      if (next === '\u05B9') { result += 'o'; skip.add(i + len); i += len * 2; continue; }
      if (next === '\u05BC') { result += 'u'; skip.add(i + len); i += len * 2; continue; }
      result += 'v'; i += len; continue;
    }

    const next = normalized[i + len];
    if (next === '\u05BC' && HEBREW_DAGESH[ch]) {
      result += HEBREW_DAGESH[ch]; skip.add(i + len);
    } else {
      result += HEBREW_CONSONANT[ch] ?? ch;
    }
    i += len;
  }
  return result || 'Hebrew';
}

// ========== 希腊语音译 ==========

const GREEK_MAP: Record<string, string> = {
  'α': 'a', 'β': 'b', 'γ': 'g', 'δ': 'd', 'ε': 'e', 'ζ': 'z',
  'η': 'e', 'θ': 'th', 'ι': 'i', 'κ': 'k', 'λ': 'l', 'μ': 'm',
  'ν': 'n', 'ξ': 'x', 'ο': 'o', 'π': 'p', 'ρ': 'r', 'σ': 's',
  'ς': 's', 'τ': 't', 'υ': 'u', 'φ': 'ph', 'χ': 'ch', 'ψ': 'ps',
  'ω': 'o',
  // 大写
  'Α': 'A', 'Β': 'B', 'Γ': 'G', 'Δ': 'D', 'Ε': 'E', 'Ζ': 'Z',
  'Η': 'E', 'Θ': 'Th', 'Ι': 'I', 'Κ': 'K', 'Λ': 'L', 'Μ': 'M',
  'Ν': 'N', 'Ξ': 'X', 'Ο': 'O', 'Π': 'P', 'Ρ': 'R', 'Σ': 'S',
  'Τ': 'T', 'Υ': 'U', 'Φ': 'Ph', 'Χ': 'Ch', 'Ψ': 'Ps', 'Ω': 'O',
};

// 希腊语中可忽略的变音符号（NFD 规范化后）
const GREEK_DIACRITIC = new Set([
  '\u0300', '\u0301', '\u0304', '\u0306', '\u0308', '\u0313', '\u0314', '\u0342', '\u0345',
]);

function transliterateGreek(word: string): string {
  // NFD 分解预组合字符（如 ά → α + ́）
  const normalized = word.normalize('NFD');
  let result = '';
  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i];
    if (GREEK_DIACRITIC.has(ch)) continue;
    if (ch === '\u03C2') { result += 's'; continue; } // 词尾 sigma
    result += GREEK_MAP[ch] ?? ch;
  }
  // 希腊语小写全转小写，便于朗读
  return result.toLowerCase() || 'Greek';
}

// ========== 检测语言类型 ==========

type LangType = 'hebrew' | 'greek';

function detectLang(word: string): LangType {
  return HEBREW_REGEX.test(word) ? 'hebrew' : 'greek';
}

// ========== 导出工具函数 ==========

export function containsHebrew(text: string): boolean {
  return HEBREW_REGEX.test(text);
}

export function containsGreek(text: string): boolean {
  return GREEK_REGEX.test(text);
}

// ========== 组件 ==========

interface HebrewTextProps {
  text: string;
  className?: string;
}

function SpeakerIcon({ playing }: { playing: boolean }) {
  return (
    <svg
      className={`w-3.5 h-3.5 transition-colors ${playing ? 'text-bible-gold' : 'text-bible-muted/60 hover:text-bible-gold'}`}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  );
}

function AncientWord({ word, lang }: { word: string; lang: LangType }) {
  const { t } = useI18n();
  const pronunciation = lang === 'hebrew' ? transliterateHebrew(word) : transliterateGreek(word);
  const [playing, setPlaying] = useState(false);
  const [errorTip, setErrorTip] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearErrorTip = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setErrorTip(null), 3000);
  }, []);

  const speak = useCallback(() => {
    // 停止之前的播放
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlaying(true);

    // 通过后端 edge-tts 获取母语发音（希伯来语/希腊语原生语音）
    const ttsUrl = `/api/v1/tts/speak?text=${encodeURIComponent(word)}&lang=${lang === 'hebrew' ? 'he' : 'el'}`;
    const audio = new Audio(ttsUrl);

    const onEnd = () => {
      setPlaying(false);
      audioRef.current = null;
    };

    audio.oncanplay = () => {
      audio.play().catch(() => {
        setErrorTip(t('hebrew.playFail'));
        setPlaying(false);
        clearErrorTip();
      });
    };
    audio.onended = onEnd;
    audio.onerror = () => {
      setPlaying(false);
      setErrorTip(t('hebrew.voiceUnavailable'));
      clearErrorTip();
      audioRef.current = null;
    };

    // 超时保护：5 秒未加载则提示
    const loadTimeout = setTimeout(() => {
      if (audio.readyState < 2) {
        setPlaying(false);
        setErrorTip(t('hebrew.voiceTimeout'));
        clearErrorTip();
      }
    }, 5000);

    audio.addEventListener('canplay', () => clearTimeout(loadTimeout), { once: true });
    audio.addEventListener('error', () => clearTimeout(loadTimeout), { once: true });

    audioRef.current = audio;
    audio.load();
  }, [word, lang, clearErrorTip, t]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const isRtl = lang === 'hebrew';
  const label = lang === 'hebrew' ? t('hebrew.hebrew') : t('hebrew.greek');

  return (
    <span className="inline-flex items-center gap-0.5 align-bottom mx-0.5 relative" dir={isRtl ? 'rtl' : 'ltr'}>
      <ruby className="inline-flex flex-col items-center" title={`${t('hebrew.pronunciation')}${pronunciation}`}>
        <span className="text-lg">{word}</span>
        <rt className="text-[0.65em] leading-tight text-amber-700 italic font-medium">
          {pronunciation}
        </rt>
      </ruby>
      <button
        type="button"
        onClick={speak}
        className="p-0.5 rounded hover:bg-bible-warm/50 transition-colors focus:outline-none focus:ring-1 focus:ring-bible-gold relative"
        title={t('hebrew.playPronunciation', { label })}
        aria-label={`${t('hebrew.playPronunciation', { label })} ${word}`}
      >
        <SpeakerIcon playing={playing} />
        {errorTip && (
          <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 whitespace-nowrap bg-bible-dark text-white text-xs px-2 py-1 rounded shadow-lg z-10">
            {errorTip}
          </span>
        )}
      </button>
    </span>
  );
}

export default function HebrewText({ text, className }: HebrewTextProps) {
  if (!text) return null;

  const parts = text.split(ANCIENT_REGEX);
  const matches = text.match(ANCIENT_REGEX) || [];
  const nodes: React.ReactNode[] = [];

  parts.forEach((part, index) => {
    if (part) {
      nodes.push(<span key={`t-${index}`}>{part}</span>);
    }
    const word = matches[index];
    if (word) {
      const lang = detectLang(word);
      nodes.push(<AncientWord key={`w-${index}`} word={word} lang={lang} />);
    }
  });

  return <span className={className}>{nodes}</span>;
}