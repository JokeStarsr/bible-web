'use client';

import React from 'react';

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
      const pronunciation = transliterateHebrew(hebrew);
      nodes.push(
        <ruby
          key={`h-${index}`}
          className="hebrew-ruby inline-flex flex-col items-center mx-0.5"
          title={`发音：${pronunciation}`}
          dir="rtl"
        >
          <span className="text-lg">{hebrew}</span>
          <rt className="text-[0.65em] leading-tight text-amber-700 italic font-medium">
            {pronunciation}
          </rt>
        </ruby>
      );
    }
  });

  return <span className={className}>{nodes}</span>;
}
