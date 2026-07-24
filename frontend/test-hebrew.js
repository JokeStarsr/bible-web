const HEBREW_REGEX = /[\u0590-\u05FF\uFB1D-\uFB4F]+/g;

const IGNORED_MARKS = new Set([
  '\u05B0', '\u05B1', '\u05B2', '\u05B3', '\u05B4', '\u05B5', '\u05B6',
  '\u05B7', '\u05B8', '\u05B9', '\u05BA', '\u05BB', '\u05BC', '\u05BD',
  '\u05BE', '\u05BF', '\u05C0', '\u05C3', '\u05C4', '\u05C5', '\u05C6', '\u05C7',
  ...Array.from({ length: 31 }, (_, i) => String.fromCharCode(0x0591 + i)),
]);

const CONSONANT_MAP = {
  'א': '', 'ב': 'b', 'בּ': 'b', 'ג': 'g', 'גּ': 'g', 'ד': 'd', 'דּ': 'd',
  'ה': 'h', 'ו': 'v', 'ז': 'z', 'ח': 'ch', 'ט': 't', 'י': 'y',
  'כ': 'ch', 'כּ': 'k', 'ך': 'ch', 'ךּ': 'k', 'ל': 'l', 'מ': 'm', 'ם': 'm',
  'נ': 'n', 'ן': 'n', 'ס': 's', 'ע': '', 'פ': 'f', 'פּ': 'p', 'ף': 'f',
  'ץ': 'ts', 'צ': 'ts', 'ק': 'k', 'ר': 'r', 'ש': 'sh', 'ת': 't', 'תּ': 't',
};

function isHebrewMark(ch) {
  const cp = ch.codePointAt(0) || 0;
  return (
    (cp >= 0x0591 && cp <= 0x05af) ||
    (cp >= 0x05b0 && cp <= 0x05bc) ||
    (cp >= 0x05bd && cp <= 0x05c0) ||
    (cp >= 0x05c3 && cp <= 0x05c7)
  );
}

function peekShinDot(normalized, startIndex) {
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

function transliterateHebrew(word) {
  const normalized = word.normalize('NFD');
  let result = '';
  let i = 0;
  const skipIndices = new Set();

  while (i < normalized.length) {
    if (skipIndices.has(i)) {
      i++;
      continue;
    }

    const codePoint = normalized.codePointAt(i);
    const ch = String.fromCodePoint(codePoint);
    const charLen = codePoint > 0xFFFF ? 2 : 1;

    if (IGNORED_MARKS.has(ch)) {
      i += charLen;
      continue;
    }

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
    result += mapped !== undefined ? mapped : ch;
    i += charLen;
  }

  return result || 'Hebrew';
}

const testCases = [
  { text: '原文词汇 בְּרֵאשִׁית（起初）和 יְהוֹשׁוּעַ（约书亚）以及 שָׂטָן（撒旦）', expected: { 'בְּרֵאשִׁית': 'brshyt', 'יְהוֹשׁוּעַ': 'yhvshv', 'שָׂטָן': 'stn' } },
  { text: 'שָׁלוֹם（平安）', expected: { 'שָׁלוֹם': 'shlvm' } },
  { text: 'יְרוּשָׁלַיִם（耶路撒冷）', expected: { 'יְרוּשָׁלַיִם': 'yrvshlym' } },
];

let allPassed = true;
for (const tc of testCases) {
  const matches = tc.text.match(HEBREW_REGEX) || [];
  console.log(`\n输入：${tc.text}`);
  for (const m of matches) {
    const actual = transliterateHebrew(m);
    const expected = tc.expected[m];
    const ok = expected === undefined || actual === expected;
    if (!ok) allPassed = false;
    console.log(`  ${m} -> ${actual}${expected && !ok ? ` (期望: ${expected})` : ''}`);
  }
}

console.log(`\n${allPassed ? '✅ 所有测试通过' : '❌ 存在失败的测试'}`);
process.exit(allPassed ? 0 : 1);
