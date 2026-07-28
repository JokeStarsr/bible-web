package com.bible.module.qt.service;

import com.bible.module.qt.dto.QtImportRequest;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
public class QtPdfService {

    /**
     * Parse a PDF file containing QT daily content and return import request.
     * Expected PDF format:
     *   Each day starts with a date marker like:
     *     X月X日 or XXXX年X月X日 or X月X日（周X）
     *   Followed by title, scripture reference, scripture text, commentary
     *
     * Supported section markers:
     *   标题： / 经文： / 经文引用： / 注释： / 分享：
     */
    public QtImportRequest parsePdf(MultipartFile file) throws IOException {
        String text = extractText(file);
        return parseToImportRequest(text);
    }

    private String extractText(MultipartFile file) throws IOException {
        try (PDDocument doc = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            return stripper.getText(doc);
        }
    }

    private QtImportRequest parseToImportRequest(String text) {
        List<QtImportRequest.QtImportItem> items = new ArrayList<>();

        // Split by date patterns like "7月27日" or "2024年7月27日" or "7月27日（周日）"
        // Also handle "第X天" patterns
        Pattern dateSplitPattern = Pattern.compile(
            "(?=\\d{1,2}月\\d{1,2}日|\\d{4}年\\d{1,2}月\\d{1,2}日|第\\d+天|Day\\s*\\d+)",
            Pattern.MULTILINE
        );

        String[] blocks = dateSplitPattern.split(text);
        // The first block before any date marker is usually header/ignored
        Matcher dateMatcher = dateSplitPattern.matcher(text);
        List<String> dateHeaders = new ArrayList<>();
        while (dateMatcher.find()) {
            dateHeaders.add(dateMatcher.group().trim());
        }

        // Match blocks with dates
        int blockIndex = 0;
        // Skip empty first block
        if (blocks.length > 0 && blocks[0].trim().isEmpty()) {
            blockIndex = 1;
        }

        for (int i = 0; i < dateHeaders.size() && blockIndex < blocks.length; i++, blockIndex++) {
            String block = blocks[blockIndex].trim();
            if (block.isEmpty()) continue;

            QtImportRequest.QtImportItem item = parseBlock(dateHeaders.get(i), block);
            if (item != null) {
                items.add(item);
            }
        }

        QtImportRequest request = new QtImportRequest();
        request.setItems(items);
        return request;
    }

    private QtImportRequest.QtImportItem parseBlock(String dateHeader, String block) {
        QtImportRequest.QtImportItem item = new QtImportRequest.QtImportItem();

        // Parse date
        String date = parseDate(dateHeader);
        if (date == null) return null;
        item.setDate(date);

        // Parse title - first line or marked with 标题：
        String[] lines = block.split("\\n");
        String title = "";
        String scriptureRef = "";
        StringBuilder scriptureText = new StringBuilder();
        StringBuilder commentary = new StringBuilder();

        String currentSection = "title"; // title, scripture, commentary

        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty()) continue;

            if (line.startsWith("标题") || line.startsWith("题目") || line.startsWith("主题")) {
                currentSection = "title";
                String v = line.replaceFirst("^.{1,3}[：:]", "").trim();
                if (!v.isEmpty()) title = v;
                continue;
            }
            if (line.startsWith("经文引用") || line.startsWith("经文出处") || line.startsWith("读经")) {
                currentSection = "scripture";
                String v = line.replaceFirst("^.{2,5}[：:]", "").trim();
                if (!v.isEmpty()) scriptureRef = v;
                continue;
            }
            if (line.startsWith("经文")) {
                currentSection = "scripture";
                String v = line.replaceFirst("^.{2,3}[：:]", "").trim();
                if (!v.isEmpty()) scriptureRef = v;
                continue;
            }
            if (line.contains("：") || line.contains(":")) {
                String beforeColon = line.split("[：:]", 2)[0].trim();
                if (beforeColon.contains("注释") || beforeColon.contains("分享") || beforeColon.contains("默想指引") || beforeColon.contains("亮光")) {
                    currentSection = "commentary";
                    String v = line.replaceFirst("^.{2,5}[：:]", "").trim();
                    if (!v.isEmpty()) commentary.append(v).append("\n");
                    continue;
                }
            }
            if (line.startsWith("默想") || line.startsWith("应用") || line.startsWith("祷告")) {
                // These are user sections, skip in import
                currentSection = "skip";
                continue;
            }

            switch (currentSection) {
                case "title":
                    if (title.isEmpty()) title = line;
                    break;
                case "scripture":
                    if (scriptureText.length() > 0) scriptureText.append("\n");
                    scriptureText.append(line);
                    break;
                case "commentary":
                    commentary.append(line).append("\n");
                    break;
            }
        }

        // If no explicit title, use first non-empty line
        if (title.isEmpty() && lines.length > 0) {
            title = lines[0];
        }

        // Auto-detect scripture reference from text if not found
        if (scriptureRef.isEmpty() && scriptureText.length() > 0) {
            scriptureRef = detectScriptureRef(scriptureText.toString());
        }

        item.setTitle(title.isEmpty() ? dateHeader : title);
        item.setScriptureReference(scriptureRef);
        item.setScriptureText(scriptureText.toString().trim());
        item.setCommentary(commentary.toString().trim());

        return item;
    }

    private String parseDate(String dateHeader) {
        // Parse "7月27日" or "2024年7月27日" to "2026-07-27"
        // Assume current year if not specified
        Pattern p = Pattern.compile("(\\d{4})?年?(\\d{1,2})月(\\d{1,2})日");
        Matcher m = p.matcher(dateHeader);
        if (m.find()) {
            String year = m.group(1);
            if (year == null) year = "2026";
            String month = String.format("%02d", Integer.parseInt(m.group(2)));
            String day = String.format("%02d", Integer.parseInt(m.group(3)));
            return year + "-" + month + "-" + day;
        }
        return null;
    }

    private String detectScriptureRef(String text) {
        // Common patterns: 马太福音 6:25-34, 诗篇 23:1-3, etc.
        Pattern p = Pattern.compile(
            "([\\u4e00-\\u9fff]{1,6}书|记|福音|诗篇|箴言|传道书|雅歌|以赛亚书|耶利米书|耶利米哀歌|以西结书|但以理书|何西阿书|约珥书|阿摩司书|俄巴底亚书|约拿书|弥迦书|那鸿书|哈巴谷书|西番雅书|哈该书|撒迦利亚书|玛拉基书|启示录)\\s*\\d{1,3}:\\d{1,3}(-\\d{1,3})?"
        );
        Matcher m = p.matcher(text);
        if (m.find()) {
            return m.group();
        }
        return "";
    }
}