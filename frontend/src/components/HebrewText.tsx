'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

// 希伯来文 Unicode 范围：基本希伯来文 + 字母呈现形式-A
const HEBREW_REGEX = /[\u0590-\u05FF\uFB1D-\uFB4F]+/g;

// 元音、发音符号、吟诵符号等（NFD 规范化后会和基字符分离）
const IGNORED_MARKS = new Set([
  // 元音
  '\u05B0', '\u05B1', '\u05B2', '\u05B3', '\u05B4', '\u05B5', '\u05B6',
  '\u05B7', '\u05B8', '\u05B9', '\u05BA', '\u05BB', '\u05BC', '\u05BD',
  '\u05BE', '\u05BF', '\u05C0', '\u05C3', '\u05C4', '\u05C5', '\u05C6', '\u05C7',
  // 吟诵符号
  ...Array.from({ length: 31 }, (_, i) => String.fromCharCode(0x0591 + i)),
]);

// 希伯来辅音到拉丁音译的映射（含词尾形式）
const CONSONANT_MAP: Record<string, string> = {
  'א': '',
  'ב': 'b',
  'בּ': 'b',
  'ג': 'g',
  'גּ': 'g',
  'ד': 'd',
  'דּ': 'd',
  'ה': 'h',
  'ו': 'v',
  'ז': 'z',
  'ח': 'ch',
  'ט': 't',
  'י': 'y',
  'כ': 'ch',
  'כּ': 'k',
  'ך': 'ch',
  'ךּ': 'k',
  'ל': 'l',
  'מ': 'm',
  'ם': 'm',
  'נ': 'n',
  'ן': 'n',
  'ס': 's',
  'ע': '',
  'פ': 'f',
  'פּ': 'p',
  'ף': 'f',
  'ץ': 'ts',
  'צ': 'ts',
  'ק': 'k',
  'ר': 'r',
  'ש': 'sh',
  'ת': 't',
  'תּ': 't',
};

function isHebrewMark(ch: string): boolean {
  const cp = ch.codePointAt(0) || 0;
  // 元音、发音符号、吟诵符号（不含 shin/sin 点，它们决定辅音发音）
  return (
    (cp >= 0x0591 && cp <= 0x05af) ||
    (cp >= 0x05b0 && cp <= 0x05bc) ||
    (cp >= 0x05bd && cp <= 0x05c0) ||
    (cp >= 0x05c3 && cp <= 0x05c7)
  );
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
  // NFD 把基字符和附标分离，便于单独处理 shin/sin 点、元音等
  const normalized = word.normalize('NFD');
  let result = '';
  let i = 0;
  const skipIndices = new Set<number>();

  while (i < normalized.length) {
    if (skipIndices.has(i)) {
      i++;
      continue;
    }

    const codePoint = normalized.codePointAt(i);
    if (codePoint === undefined) break;

    const ch = String.fromCodePoint(codePoint);
    const charLen = codePoint > 0xFFFF ? 2 : 1;

    // 忽略元音、吟诵符号、dagesh 等附标
    if (IGNORED_MARKS.has(ch)) {
      i += charLen;
      continue;
    }

    // 处理 shin(ׁ) / sin(ׂ) 点（可能在元音之后）
    if (ch === 'ש') {
      const dot = peekShinDot(normalized, i + charLen);
      if (dot) {
        result += dot.sound;
        skipIndices.add(dot.index);
      } else {
        result += 'sh';
      }
      i += charLen;
      continue;
    }

    const mapped = CONSONANT_MAP[ch];
    if (mapped !== undefined) {
      result += mapped;
    } else {
      // 保留希伯来文中的连字符、空格等可见字符
      result += ch;
    }

    i += charLen;
  }

  return result || 'Hebrew';
}

export function containsHebrew(text: string): boolean {
  return HEBREW_REGEX.test(text);
}

interface HebrewTextProps {
  text: string;
  className?: string;
}

// 小喇叭图标
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

// 单个希伯来文词组 + 音译 + 发音按钮
function HebrewWord({ word }: { word: string }) {
  const pronunciation = transliterateHebrew(word);
  const [playing, setPlaying] = useState(false);
  const [errorTip, setErrorTip] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearErrorTip = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setErrorTip(null), 3000);
  }, []);

  const doSpeak = useCallback((voices: SpeechSynthesisVoice[]) => {
    const synth = window.speechSynthesis;
    const hebrewVoice = voices.find((v) => v.lang.startsWith('he') || v.lang.startsWith('iw'));

    if (voices.length > 0 && !hebrewVoice) {
      setErrorTip('未找到希伯来语语音，请尝试切换浏览器');
      clearErrorTip();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'he-IL';
    utterance.rate = 0.85;
    utterance.pitch = 1;
    if (hebrewVoice) {
      utterance.voice = hebrewVoice;
    }

    utterance.onstart = () => setPlaying(true);
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => {
      setPlaying(false);
      setErrorTip('朗读失败，请重试');
      clearErrorTip();
    };

    utteranceRef.current = utterance;
    synth.speak(utterance);
  }, [word, clearErrorTip]);

  const speak = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setErrorTip('当前浏览器不支持语音朗读');
      clearErrorTip();
      return;
    }

    const synth = window.speechSynthesis;

    // Chrome 在后台 tab 或长时间未使用后可能进入暂停状态，先 resume
    try {
      synth.resume();
    } catch {
      // ignore
    }

    // 取消当前所有朗读，避免重叠
    synth.cancel();

    const voices = synth.getVoices();
    if (voices.length === 0 && 'onvoiceschanged' in synth) {
      // 某些浏览器需要等待语音列表加载
      const handleVoicesChanged = () => {
        synth.removeEventListener('voiceschanged', handleVoicesChanged);
        doSpeak(synth.getVoices());
      };
      synth.addEventListener('voiceschanged', handleVoicesChanged);
      // 超时兜底
      timeoutRef.current = setTimeout(() => {
        synth.removeEventListener('voiceschanged', handleVoicesChanged);
        doSpeak(synth.getVoices());
      }, 800);
      return;
    }

    doSpeak(voices);
  }, [doSpeak]);

  // 组件卸载时停止朗读
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (utteranceRef.current && typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <span className="inline-flex items-center gap-0.5 align-bottom mx-0.5 relative" dir="rtl">
      <ruby
        className="hebrew-ruby inline-flex flex-col items-center"
        title={`发音：${pronunciation}`}
      >
        <span className="text-lg">{word}</span>
        <rt className="text-[0.65em] leading-tight text-amber-700 italic font-medium">
          {pronunciation}
        </rt>
      </ruby>
      <button
        type="button"
        onClick={speak}
        className="p-0.5 rounded hover:bg-bible-warm/50 transition-colors focus:outline-none focus:ring-1 focus:ring-bible-gold relative"
        title="播放希伯来语发音"
        aria-label={`播放 ${word} 的希伯来语发音`}
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

  const parts = text.split(HEBREW_REGEX);
  const matches = text.match(HEBREW_REGEX) || [];
  const nodes: React.ReactNode[] = [];

  parts.forEach((part, index) => {
    if (part) {
      nodes.push(<span key={`t-${index}`}>{part}</span>);
    }
    const hebrew = matches[index];
    if (hebrew) {
      nodes.push(<HebrewWord key={`h-${index}`} word={hebrew} />);
    }
  });

  return <span className={className}>{nodes}</span>;
}
