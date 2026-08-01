package com.bible.module.qt.service;

import com.bible.module.qt.dto.QtImportRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * QT 灵修内容「确定性格式化解析器」
 *
 * <p>针对《每日灵修手册》标准版式的粘贴文本，按固定规则解析为结构化字段，
 * 输出排版与手工编写 SQL 迁移脚本完全一致，避免 LLM 解析的不稳定性。
 *
 * <p>固化规则（对齐 2026-08-01 排版基准）：
 * <ul>
 *   <li>scriptureText：行内合并节拆为单节；中英对照节配对；无英文节仅中文；节间空行分隔；首尾无换行</li>
 *   <li>commentary：按空行分段；标记段（今日经文摘要/今日祷告/默想散文/一节默想）独占时与下段合并；
 *       经文解释小标题格式化为「标题｜章节节～节」；问题行独立成块；散文正文段每段独立；金句去「……」装饰线；
 *       所有词解 + 全年读经合并为末尾脚注块；首尾无换行</li>
 *   <li>hymn：首行诗歌名 + 歌词 + 「— 来源」标注；首尾无换行</li>
 * </ul>
 */
@Slf4j
@Service
public class QtFormatParser {

    // 书卷名（用于经文出处识别）
    private static final String BOOK_NAMES =
            "创世记|出埃及记|利未记|民数记|申命记|约书亚记|士师记|路得记|撒母耳记上|撒母耳记下|" +
            "列王纪上|列王纪下|历代志上|历代志下|以斯拉记|尼希米记|以斯帖记|约伯记|诗篇|箴言|传道书|雅歌|" +
            "以赛亚书|耶利米书|耶利米哀歌|以西结书|但以理书|何西阿书|约珥书|阿摩司书|俄巴底亚书|约拿书|" +
            "弥迦书|那鸿书|哈巴谷书|西番雅书|哈该书|撒迦利亚书|玛拉基书|" +
            "马太福音|马可福音|路加福音|约翰福音|使徒行传|罗马书|哥林多前书|哥林多后书|加拉太书|" +
            "以弗所书|腓立比书|歌罗西书|帖撒罗尼迦前书|帖撒罗尼迦后书|提摩太前书|提摩太后书|提多书|腓利门书|" +
            "希伯来书|雅各书|彼得前书|彼得后书|约翰一书|约翰二书|约翰三书|犹大书|启示录";

    // 标题行：序号 · 标题（支持 · • ． 等分隔符）
    private static final Pattern TITLE_PATTERN = Pattern.compile("^\\d+\\s*[·•．.・]\\s*(.+)$");

    // 经文出处：书卷名 章：节～节（支持中英冒号、～~-–—）
    private static final Pattern REF_PATTERN = Pattern.compile(
            "^(" + BOOK_NAMES + ")\\s*(\\d+)\\s*[:：]\\s*(\\d+)\\s*[~～\\-–—]\\s*(\\d+)$");

    // 经文解释小标题：标题 章节节～节（空格分隔，需转 ｜）
    private static final Pattern COMMENTARY_TITLE_PATTERN = Pattern.compile(
            "^(.+?)\\s+(\\d+)\\s*[:：]\\s*(\\d+)\\s*[~～\\-–—]\\s*(\\d+)$");

    // 行内节号：词边界 + 1-3 位数字 + 词边界
    // 用 \b 替代 lookbehind，避免 full-width 字符（如「：」）后 lookbehind 失效；
    // 兼容「17 人子」（有空格）与「17「人子」（无空格紧接标点）两种中文排版
    private static final Pattern VERSE_NUM_PATTERN =
            Pattern.compile("\\b\\d{1,3}\\b");

    // 词解行：xxx（N节）：...（支持全/半角括号、冒号）
    private static final Pattern GLOSS_PATTERN =
            Pattern.compile("^.+?[（(]\\d+\\s*节[)）]\\s*[：:].+$");

    // 金句装饰线行（连续 … 或 …… 或 。组成的装饰）
    private static final Pattern DECOR_LINE_PATTERN = Pattern.compile("^[\\.…]{3,}$");

    /**
     * 解析粘贴文本为结构化 QT 内容
     * @param rawText 用户粘贴的原始文本
     * @param targetDate 目标日期 yyyy-MM-dd（非空时覆盖）
     */
    public QtImportRequest parse(String rawText, String targetDate) {
        if (rawText == null || rawText.isBlank()) {
            throw new IllegalArgumentException("文本内容为空");
        }

        List<String> lines = normalize(rawText);
        String title = extractTitle(lines);
        String ref = extractScriptureReference(lines);
        String scriptureText = extractScriptureText(lines);
        String hymn = extractHymn(lines);
        String commentary = extractCommentary(lines);

        QtImportRequest.QtImportItem item = new QtImportRequest.QtImportItem();
        item.setDate(targetDate != null && !targetDate.isBlank() ? targetDate : extractDate(lines));
        item.setTitle(title);
        item.setScriptureReference(ref);
        item.setScriptureText(scriptureText);
        item.setCommentary(commentary);
        item.setHymn(hymn);

        QtImportRequest req = new QtImportRequest();
        req.setItems(Collections.singletonList(item));
        log.info("QtFormatParser parsed: date={}, title={}, ref={}, scriptureLen={}, commentaryLen={}, hymnLen={}",
                item.getDate(), title, ref, scriptureText.length(), commentary.length(), hymn.length());
        return req;
    }

    // ==================== 预处理 ====================

    private List<String> normalize(String rawText) {
        String[] rawLines = rawText.replace("\r\n", "\n").replace("\r", "\n").split("\n", -1);
        List<String> out = new ArrayList<>();
        for (String l : rawLines) {
            String trimmed = l.trim();
            // 去除页码行：August 45 / 纯数字 45
            if (trimmed.matches("^August\\s+\\d+$") || trimmed.matches("^\\d{1,3}$")) {
                continue;
            }
            // 剥离「全年读经」行前缀的页码：52 全年读经 □... → 全年读经 □...
            if (trimmed.matches("^\\d+\\s+全年读经.*$")) {
                trimmed = trimmed.replaceFirst("^\\d+\\s+", "");
            }
            out.add(trimmed);
        }
        return out;
    }

    // ==================== 字段提取 ====================

    private String extractTitle(List<String> lines) {
        for (String l : lines) {
            Matcher m = TITLE_PATTERN.matcher(l);
            if (m.matches()) {
                return m.group(1).trim();
            }
        }
        return "每日灵修";
    }

    private String extractScriptureReference(List<String> lines) {
        for (String l : lines) {
            Matcher m = REF_PATTERN.matcher(l);
            if (m.matches()) {
                return m.group(1) + " " + m.group(2) + ":" + m.group(3) + "~" + m.group(4);
            }
        }
        return "";
    }

    private String extractDate(List<String> lines) {
        // 从「礼拜X」辅助推断不可靠（跨月），返回空交由上层处理
        return "";
    }

    /**
     * 经文提取：扫描全文所有行，收集经文节（行内合并节拆为单节），
     * 中英文按节号配对，无英文节仅输出中文，节间空行分隔。
     */
    private String extractScriptureText(List<String> lines) {
        TreeMap<Integer, String> cnVerses = new TreeMap<>();
        TreeMap<Integer, String> enVerses = new TreeMap<>();

        for (String l : lines) {
            if (!isVerseLine(l)) continue;
            collectVersesFromLine(l, cnVerses, enVerses);
        }

        if (cnVerses.isEmpty() && enVerses.isEmpty()) return "";

        TreeSet<Integer> allNums = new TreeSet<>();
        allNums.addAll(cnVerses.keySet());
        allNums.addAll(enVerses.keySet());

        StringBuilder sb = new StringBuilder();
        boolean first = true;
        for (int n : allNums) {
            if (!first) sb.append("\n\n");
            String cn = cnVerses.get(n);
            String en = enVerses.get(n);
            // 不额外加空格：原文分隔符（空格或紧接标点）已保留在 text 首部
            if (cn != null) sb.append(n).append(cn);
            if (en != null) {
                if (cn != null) sb.append("\n");
                sb.append(n).append(en);
            }
            first = false;
        }
        return sb.toString();
    }

    /** 判断是否为经文节行：行首「数字+空格」，且非标题行（无 · • ）、非全年读经行 */
    private boolean isVerseLine(String l) {
        if (!l.matches("^\\d{1,3}\\s+.+")) return false;
        if (TITLE_PATTERN.matcher(l).matches()) return false;        // "06 · 标题"
        if (l.contains("全年读经")) return false;                     // "52 全年读经"
        if (GLOSS_PATTERN.matcher(l).matches()) return false;        // 词解行
        return true;
    }

    /** 从一行中收集所有节（处理行内合并节），按语言分入 cnVerses/enVerses */
    private void collectVersesFromLine(String line, Map<Integer, String> cn, Map<Integer, String> en) {
        Matcher m = VERSE_NUM_PATTERN.matcher(line);
        List<int[]> positions = new ArrayList<>();
        List<Integer> nums = new ArrayList<>();
        while (m.find()) {
            positions.add(new int[]{m.start(), m.end()});
            nums.add(Integer.parseInt(line.substring(m.start(), m.end())));
        }
        if (positions.isEmpty()) return;

        for (int i = 0; i < positions.size(); i++) {
            int textStart = positions.get(i)[1]; // 节号末尾位置
            int textEnd = (i + 1 < positions.size()) ? positions.get(i + 1)[0] : line.length();
            if (textStart > textEnd) continue;
            // 保留前导空白（原文节号后的分隔符：空格或紧接标点），仅去尾部空白
            // 这样「16 耶和华」保留为「 耶和华」、「17「人子」保留为「「人子」，与手写 SQL 一致
            String text = line.substring(textStart, textEnd).stripTrailing();
            if (text.isEmpty()) continue;
            int num = nums.get(i);
            // 语言检测用 stripped 版本（避免前导空格干扰 isEnglish 首字符判断）
            String stripped = text.strip();
            if (isChinese(stripped)) {
                cn.put(num, text);
            } else if (isEnglish(stripped)) {
                en.put(num, text);
            }
        }
    }

    private boolean isChinese(String s) {
        return s.chars().anyMatch(c -> c >= 0x4e00 && c <= 0x9fff);
    }

    private boolean isEnglish(String s) {
        if (s.isEmpty()) return false;
        if (isChinese(s)) return false;
        // 韩文排除
        if (s.chars().anyMatch(c -> c >= 0xac00 && c <= 0xd7af)) return false;
        char c = s.charAt(0);
        return Character.isLetter(c) || c == '"' || c == '(' || c == '\'';
    }

    // ==================== 诗歌提取 ====================

    private String extractHymn(List<String> lines) {
        int hymnStart = -1;
        for (int i = 0; i < lines.size(); i++) {
            if (lines.get(i).startsWith("今日诗歌")) {
                hymnStart = i;
                break;
            }
        }
        if (hymnStart < 0) return "";

        List<String> body = new ArrayList<>();
        String firstLine = lines.get(hymnStart);
        // 诗歌名：今日诗歌 后的内容（若无则取下一非空行）
        String hymnName = firstLine.replaceFirst("^今日诗歌\\s*", "").trim();
        int idx = hymnStart + 1;
        if (hymnName.isEmpty()) {
            while (idx < lines.size() && lines.get(idx).isEmpty()) idx++;
            if (idx < lines.size()) {
                hymnName = lines.get(idx);
                idx++;
            }
        }
        body.add(hymnName);

        // 收集歌词直到遇到段落结束标记（空行后接「今日经文摘要」或经文节行）
        boolean sawContent = false;
        for (; idx < lines.size(); idx++) {
            String l = lines.get(idx);
            if (l.isEmpty()) {
                if (sawContent) break; // 空行结束歌词段
                continue;
            }
            // 遇到经文摘要/经文节则停止
            if (l.startsWith("今日经文摘要")) break;
            if (l.matches("^\\d{1,3}\\s+.+") && !l.contains("全年读经")) break;
            body.add(l);
            sawContent = true;
        }

        // 来源标注：若末行不是「— 来源」格式，且含「三一敬拜」等来源信息则补「— 」前缀
        String result = String.join("\n", body);
        result = ensureSourceSuffix(result);
        return result;
    }

    private String ensureSourceSuffix(String hymn) {
        String[] parts = hymn.split("\n", -1);
        String last = parts[parts.length - 1].trim();
        boolean hasSourceMark = last.startsWith("—") || last.startsWith("-");
        boolean looksLikeSource = last.contains("三一敬拜") || last.contains("系列") || last.contains("《");
        if (!hasSourceMark && !looksLikeSource) {
            return hymn;
        }
        // 来源行与歌词间空一行（对齐 V29 手写 SQL 排版）
        String head = parts.length > 1
                ? String.join("\n", java.util.Arrays.copyOf(parts, parts.length - 1))
                : "";
        String sourceLine = hasSourceMark ? last : "— " + last;
        return head + "\n\n" + sourceLine;
    }

    // ==================== 注释提取（核心） ====================

    private String extractCommentary(List<String> lines) {
        // 按连续空行分段（每段为非空行集合）
        List<List<String>> paras = splitParagraphs(lines);

        List<String> blocks = new ArrayList<>();
        List<String> footnotes = new ArrayList<>(); // 词解行
        String readingPlan = null;                   // 全年读经（独立存储，末尾追加）

        int i = 0;
        while (i < paras.size()) {
            List<String> para = paras.get(i);
            String firstLine = para.isEmpty() ? "" : para.get(0);
            String firstTrim = firstLine.trim();

            // 词解段 → 收集脚注
            if (GLOSS_PATTERN.matcher(firstTrim).matches()) {
                footnotes.addAll(collectGlossLines(para));
                i++;
                continue;
            }
            // 全年读经段 → 单独存储，脚注块末尾追加（对齐 V29 手写 SQL：词解在前，读经在后）
            if (firstTrim.startsWith("全年读经")) {
                readingPlan = firstTrim;
                i++;
                continue;
            }
            // 金句块（含装饰线）→ 去装饰线，作为独立块
            if (isGoldenSentencePara(para)) {
                String golden = extractGoldenSentence(para);
                if (!golden.isEmpty()) blocks.add(golden);
                i++;
                continue;
            }
            // 经文解释标记 → 跳过
            if (firstTrim.equals("经文解释")) {
                i++;
                continue;
            }
            // 今日经文摘要
            if (firstTrim.startsWith("今日经文摘要")) {
                blocks.add(joinPara(mergeWithNextIfTitleOnly(para, paras, i, "今日经文摘要")));
                i = nextIndexAfterMerge(para, paras, i, "今日经文摘要");
                continue;
            }
            // 今日祷告
            if (firstTrim.equals("今日祷告")) {
                blocks.add(joinPara(mergeWithNextIfTitleOnly(para, paras, i, "今日祷告")));
                i = nextIndexAfterMerge(para, paras, i, "今日祷告");
                continue;
            }
            // 默想散文：标记 + 标题/来源/作者 合并首块；后续正文段独立
            if (firstTrim.equals("默想散文")) {
                List<String> headPara = mergeWithNextIfTitleOnly(para, paras, i, "默想散文");
                // 来源行末尾的「／」（全角斜杠，原书用于分隔来源与作者）需移除，对齐手写 SQL 排版
                List<String> cleanedHead = new ArrayList<>();
                for (int k = 0; k < headPara.size(); k++) {
                    String hl = headPara.get(k);
                    if (k > 0) { // 跳过「默想散文」标记行
                        hl = hl.replaceAll("[／/]+$", "").trim();
                    }
                    cleanedHead.add(hl);
                }
                blocks.add(joinPara(cleanedHead));
                int nextI = nextIndexAfterMerge(para, paras, i, "默想散文");
                // 后续散文正文段（直到金句/一节默想/词解/全年读经）
                while (nextI < paras.size()) {
                    List<String> np = paras.get(nextI);
                    String nf = np.isEmpty() ? "" : np.get(0).trim();
                    if (nf.equals("一节默想") || isGoldenSentencePara(np)
                            || GLOSS_PATTERN.matcher(nf).matches() || nf.startsWith("全年读经")
                            || isCommentaryTitleLine(nf)) break;
                    blocks.add(joinPara(np));
                    nextI++;
                }
                i = nextI;
                continue;
            }
            // 一节默想：标记 + 正文 合并
            if (firstTrim.equals("一节默想")) {
                blocks.add(joinPara(mergeWithNextIfTitleOnly(para, paras, i, "一节默想")));
                i = nextIndexAfterMerge(para, paras, i, "一节默想");
                continue;
            }
            // 经文解释小标题行（标题 章节节～节）
            if (isCommentaryTitleLine(firstTrim)) {
                List<String> merged = mergeWithNextIfTitleOnly(para, paras, i, null);
                blocks.add(formatCommentaryTitleBlock(merged));
                i = nextIndexAfterMerge(para, paras, i, null);
                continue;
            }
            // 问题行（以？结尾的短段，独立成块）
            if (isQuestionPara(para)) {
                blocks.add(joinPara(para));
                i++;
                continue;
            }
            // 以下为需跳过的杂项段（经文/出处/标题/礼拜/版面说明/诗歌，均已在其他字段提取）
            if (isVerseLine(firstTrim)) { i++; continue; }                       // 经文节段
            if (REF_PATTERN.matcher(firstTrim).matches()) { i++; continue; }     // 经文出处行
            if (TITLE_PATTERN.matcher(firstTrim).matches()) { i++; continue; }   // 标题行（序号·标题）
            if (firstTrim.startsWith("礼拜")) { i++; continue; }                  // 礼拜X 行
            if (firstTrim.startsWith("今日诗歌")) { i++; continue; }               // 诗歌段（由 extractHymn 处理）
            if (firstTrim.startsWith("*") || firstTrim.contains("版面有限")) { i++; continue; } // 版面说明
            // 其余非空段（散文正文等）→ 独立块
            if (!firstTrim.isEmpty()) {
                blocks.add(joinPara(para));
            }
            i++;
        }

        // 脚注合并为末尾块：词解在前，全年读经追加最后（对齐 V29 手写 SQL 排版）
        if (!footnotes.isEmpty() || readingPlan != null) {
            List<String> footnoteBlock = new ArrayList<>(footnotes);
            if (readingPlan != null) footnoteBlock.add(readingPlan);
            blocks.add(String.join("\n", footnoteBlock));
        }

        return String.join("\n\n", blocks).trim();
    }

    /** 按连续空行分段 */
    private List<List<String>> splitParagraphs(List<String> lines) {
        List<List<String>> paras = new ArrayList<>();
        List<String> cur = new ArrayList<>();
        for (String l : lines) {
            if (l.isEmpty()) {
                if (!cur.isEmpty()) {
                    paras.add(cur);
                    cur = new ArrayList<>();
                }
            } else {
                cur.add(l);
            }
        }
        if (!cur.isEmpty()) paras.add(cur);
        return paras;
    }

    private String joinPara(List<String> para) {
        return String.join("\n", para).trim();
    }

    /** 若段落仅含标题行（无正文），则与下一段合并 */
    private List<String> mergeWithNextIfTitleOnly(List<String> para, List<List<String>> paras, int i, String marker) {
        if (para.size() > 1) return para; // 已含正文
        if (i + 1 < paras.size()) {
            List<String> merged = new ArrayList<>(para);
            merged.addAll(paras.get(i + 1));
            return merged;
        }
        return para;
    }

    /** 计算合并后的下一索引 */
    private int nextIndexAfterMerge(List<String> para, List<List<String>> paras, int i, String marker) {
        if (para.size() > 1) return i + 1;
        return i + 2; // 合并了下一段
    }

    /** 经文解释小标题行判断 */
    private boolean isCommentaryTitleLine(String line) {
        if (line.isEmpty()) return false;
        return COMMENTARY_TITLE_PATTERN.matcher(line).matches();
    }

    /** 格式化经文解释块：首行小标题「标题 章节节～节」→「标题｜章节节～节」 */
    private String formatCommentaryTitleBlock(List<String> para) {
        if (para.isEmpty()) return "";
        List<String> out = new ArrayList<>();
        Matcher m = COMMENTARY_TITLE_PATTERN.matcher(para.get(0));
        if (m.matches()) {
            out.add(m.group(1) + "｜" + m.group(2) + "：" + m.group(3) + "～" + m.group(4));
        } else {
            out.add(para.get(0));
        }
        for (int k = 1; k < para.size(); k++) out.add(para.get(k));
        return String.join("\n", out).trim();
    }

    /** 问题段：单行且以？结尾 */
    private boolean isQuestionPara(List<String> para) {
        if (para.size() != 1) return false;
        String l = para.get(0).trim();
        return l.endsWith("？") || l.endsWith("?");
    }

    /** 金句段：含装饰线行 */
    private boolean isGoldenSentencePara(List<String> para) {
        return para.stream().anyMatch(l -> DECOR_LINE_PATTERN.matcher(l.trim()).matches());
    }

    /** 提取金句正文（去装饰线行，去行内 … 装饰） */
    private String extractGoldenSentence(List<String> para) {
        List<String> out = new ArrayList<>();
        for (String l : para) {
            String t = l.trim();
            if (DECOR_LINE_PATTERN.matcher(t).matches()) continue;
            // 去行内装饰（行首/行尾的 …）
            t = t.replaceAll("^[\\.…]+\\s*", "").replaceAll("\\s*[\\.…]+$", "").trim();
            if (!t.isEmpty()) out.add(t);
        }
        return String.join("\n", out);
    }

    /** 从段中收集词解行（一段可能含多条词解，或仅为散文正文——只收词解） */
    private List<String> collectGlossLines(List<String> para) {
        List<String> out = new ArrayList<>();
        for (String l : para) {
            String t = l.trim();
            if (GLOSS_PATTERN.matcher(t).matches()) {
                // 词解行节号括号统一为全角「（）」，对齐手写 SQL 排版（原书排版用半角）
                t = t.replaceAll("\\((\\d+\\s*节)\\)", "（$1）");
                out.add(t);
            }
        }
        return out;
    }
}
