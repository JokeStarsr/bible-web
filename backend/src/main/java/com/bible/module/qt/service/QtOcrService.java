package com.bible.module.qt.service;

import com.bible.config.LlmService;
import com.bible.module.qt.dto.QtImportRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * QT 图片 OCR 识别服务
 *
 * 识别策略（按优先级）：
 * 1. LLM 视觉模型直接识别图片（准确率最高，速度最快）
 * 2. Tesseract OCR + LLM 文本解析（降级方案）
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class QtOcrService {

    private final LlmService llmService;
    private final ObjectMapper objectMapper;

    /**
     * 从上传的图片中识别 QT 灵修内容
     */
    public QtImportRequest recognizeFromImage(MultipartFile file) throws Exception {
        byte[] imageBytes = file.getBytes();
        String mimeType = file.getContentType();
        if (mimeType == null || !mimeType.startsWith("image/")) {
            mimeType = "image/jpeg";
        }

        // 1. 优先用 LLM 视觉模型直接识别图片
        if (llmService.isVisionAvailable()) {
            try {
                log.info("尝试用 LLM 视觉模型识别图片, size={}KB", imageBytes.length / 1024);
                QtImportRequest result = recognizeWithVision(imageBytes, mimeType);
                if (result != null && result.getItems() != null && !result.getItems().isEmpty()) {
                    log.info("LLM 视觉模型识别成功, items={}", result.getItems().size());
                    return result;
                }
                log.warn("LLM 视觉模型未返回有效内容，降级到 Tesseract");
            } catch (Exception e) {
                log.warn("LLM 视觉模型识别失败，降级到 Tesseract: {}", e.getMessage());
            }
        }

        // 2. 降级：Tesseract OCR + LLM 文本解析
        log.info("使用 Tesseract OCR + LLM 文本解析");
        Path processedPath = preprocessImage(imageBytes);
        String rawText = runTesseract(processedPath);
        log.info("OCR raw text length={}, first 200 chars: {}", rawText.length(),
                rawText.length() > 200 ? rawText.substring(0, 200) : rawText);

        if (rawText.isBlank()) {
            throw new RuntimeException("图片中未识别到任何文字，请确保图片清晰");
        }

        QtImportRequest result = parseWithLlm(rawText);
        if (result == null || result.getItems() == null || result.getItems().isEmpty()) {
            throw new RuntimeException("无法从识别文字中解析出 QT 内容，请检查图片是否清晰、内容是否完整");
        }
        return result;
    }

    // ==================== 方案一：LLM 视觉模型直接识别 ====================

    private QtImportRequest recognizeWithVision(byte[] imageBytes, String mimeType) throws Exception {
        String systemPrompt = """
                你是一个专业的 QT（Quiet Time）灵修内容识别助手。
                用户会上传每日灵修的图片，请你仔细识别图片中的全部文字内容，并提取结构化信息。

                需要提取的字段：
                1. date: 日期，格式 yyyy-MM-dd（如 2026-07-27）。如果只有月日没有年份，默认年份为 2026。
                2. title: 灵修内容的主题标题。
                3. scriptureReference: 经文出处，如 "罗马书 1:1-7"、"创世记 12:1-3"。
                4. scriptureText: 经文正文内容（完整的经文文字）。
                5. commentary: 注释/默想/亮光等解释性内容。
                6. hymn: 诗歌内容（如有）。

                要求：
                - 仔细识别图片中的每一个字，尽量完整准确地还原文字。
                - 如果图片中包含多天的内容，请分别提取为多个 item。
                - 如果某个字段确实无法识别，设为空字符串 ""。
                - 但 date 和 scriptureText 不能都为空，否则视为无效。
                - 返回纯 JSON，不要 markdown 标记，不要多余解释。

                返回格式：
                {
                  "items": [
                    {
                      "date": "2026-07-27",
                      "title": "标题",
                      "scriptureReference": "经文出处",
                      "scriptureText": "经文正文",
                      "commentary": "注释内容",
                      "hymn": "诗歌内容"
                    }
                  ]
                }
                """;

        String userPrompt = "请识别这张灵修图片中的内容并提取结构化信息。";

        String imageBase64 = Base64.getEncoder().encodeToString(imageBytes);
        String response = llmService.chatWithImage(systemPrompt, userPrompt, imageBase64, mimeType);
        String json = llmService.extractJson(response);
        log.info("LLM vision parsed QT JSON (first 300): {}",
                json != null && json.length() > 300 ? json.substring(0, 300) : json);

        return parseItemsFromJson(json);
    }

    // ==================== 方案三：直接文本解析（用户粘贴文本） ====================

    /**
     * 从用户粘贴的原始文本中解析 QT 灵修内容
     * 复用 parseWithLlm 的 LLM 解析逻辑，跳过图片识别步骤
     * @param rawText 用户粘贴的原始文本
     * @param targetDate 用户指定的目标日期（yyyy-MM-dd），非空时覆盖 LLM 推断的日期
     */
    public QtImportRequest recognizeFromText(String rawText, String targetDate) throws Exception {
        if (rawText == null || rawText.isBlank()) {
            throw new RuntimeException("文本内容为空");
        }
        log.info("解析用户粘贴的文本, length={}, targetDate={}", rawText.length(), targetDate);
        QtImportRequest result = parseWithLlm(rawText);
        if (result == null || result.getItems() == null || result.getItems().isEmpty()) {
            throw new RuntimeException("无法从文本中解析出 QT 内容，请检查文本是否完整");
        }
        // 用户指定日期时，覆盖所有 item 的日期
        if (targetDate != null && !targetDate.isBlank()) {
            for (QtImportRequest.QtImportItem item : result.getItems()) {
                item.setDate(targetDate);
            }
            log.info("已用用户指定日期 {} 覆盖 {} 条记录", targetDate, result.getItems().size());
        }
        return result;
    }

    // ==================== 方案二：Tesseract OCR + LLM 文本解析（降级） ====================

    private QtImportRequest parseWithLlm(String rawText) {
        String systemPrompt = """
                你是一个专业的 QT（Quiet Time）灵修内容解析助手。用户会给你一段 OCR 识别文字，包含日期、标题、经文出处、经文正文、注释/默想散文、诗歌等。请提取结构化信息，返回纯 JSON。

                字段说明：
                1. date: 日期 yyyy-MM-dd，默认年份 2026。经文章节号（如 29:1~7）和历史日期（如"第十年十月十二日"）不是灵修日期；页码（如 July 129）也不是。若文本无明文日期，根据"礼拜X"配合 2026年7月日历推算（周三=7/29、周四=7/30、周五=7/31），无法确定则设为空字符串。
                2. title: 灵修主题标题（如"不要倚靠芦苇杖"）。
                3. scriptureReference: 经文出处，如"以西结书 29:1~16"。
                4. scriptureText: 仅圣经经文本身（中英文对照），严禁混入标题、日期、礼拜几、经文出处、注释、诗歌。每节"中文一行+英文一行"交替，节间用空行分隔。每行开头必须用普通阿拉伯数字节号+空格（如"10 "），OCR 中的上标节号（¹²³⁴⁵⁶⁷⁸⁹）必须转换为普通数字。第一节经文必须是真正的经文内容，不能是标题或出处。
                5. commentary: 注释/默想散文/亮光，含多个小节（如"今日经文摘要"、经文解释小标题、"一节默想"、"祷告"），小节标题独占一行，小节间空行分隔。不含诗歌歌词。
                6. hymn: "今日诗歌"标记后的诗歌歌词，第一行为诗歌名，后续每句歌词独占一行，最后用"— 来源"标注。OCR 错别字请智能修正。即使诗歌歌词散落在文本各处，也要完整提取到 hymn，不能为空。

                字段归类优先级（严格遵守）：
                - 先识别"今日诗歌"标记，其后的歌词段落完整放入 hymn，hymn 不可为空。
                - scriptureText 只保留真正的圣经经文，开头不能有"礼拜X"、日期数字、标题、经文出处等非经文内容。
                - commentary 只保留解释性文字，不含诗歌歌词。

                OCR 错别字请根据上下文智能修正。多天内容分别提取为多个 item。字段无法识别设为空字符串。

                返回格式（纯 JSON，不要 markdown 标记，不要解释文字）：
                {"items":[{"date":"","title":"","scriptureReference":"","scriptureText":"","commentary":"","hymn":""}]}
                """;

        String userPrompt = "以下是 OCR 识别的原始文字，请解析为结构化 QT 内容：\n\n" + rawText;

        try {
            String response = llmService.chat(systemPrompt, userPrompt);
            String json = llmService.extractJson(response);
            log.info("LLM parsed QT JSON (first 300): {}",
                    json != null && json.length() > 300 ? json.substring(0, 300) : json);
            QtImportRequest result = parseItemsFromJson(json);
            // LLM 返回空/null 时走降级正则解析，避免直接返回 null 导致上层报错
            if (result == null || result.getItems() == null || result.getItems().isEmpty()) {
                log.warn("LLM 未解析出有效内容，降级到正则解析");
                return fallbackParse(rawText);
            }
            return result;
        } catch (Exception e) {
            log.error("LLM parsing failed", e);
            return fallbackParse(rawText);
        }
    }

    // ==================== 公共解析逻辑 ====================

    private QtImportRequest parseItemsFromJson(String json) throws Exception {
        if (json == null || json.isBlank()) {
            return null;
        }
        JsonNode root = objectMapper.readTree(json);
        JsonNode itemsNode = root.path("items");
        if (!itemsNode.isArray() || itemsNode.isEmpty()) {
            return null;
        }

        QtImportRequest request = new QtImportRequest();
        List<QtImportRequest.QtImportItem> items = new ArrayList<>();

        for (JsonNode itemNode : itemsNode) {
            QtImportRequest.QtImportItem item = new QtImportRequest.QtImportItem();
            item.setDate(getTextValue(itemNode, "date"));
            item.setTitle(getTextValue(itemNode, "title"));
            item.setScriptureReference(getTextValue(itemNode, "scriptureReference"));
            item.setScriptureText(getTextValue(itemNode, "scriptureText"));
            item.setCommentary(getTextValue(itemNode, "commentary"));
            item.setHymn(getTextValue(itemNode, "hymn"));

            // 至少要有日期或经文内容才算有效
            if (item.getDate().isEmpty() && item.getScriptureText().isEmpty()) {
                continue;
            }
            items.add(item);
        }

        request.setItems(items);
        return request;
    }

    /**
     * 降级解析：当 LLM 不可用时，用正则表达式尝试提取
     */
    private QtImportRequest fallbackParse(String rawText) {
        log.info("Using fallback regex parsing");
        List<QtImportRequest.QtImportItem> items = new ArrayList<>();

        QtImportRequest.QtImportItem item = new QtImportRequest.QtImportItem();
        item.setDate("");
        item.setTitle("每日灵修");
        item.setScriptureReference("");
        item.setScriptureText(rawText);
        item.setCommentary("");
        item.setHymn("");

        // 1. 优先匹配显式日期：X月X日 / M月D日 / MM-DD / MM/DD
        Pattern datePattern = Pattern.compile("(\\d{1,2})月(\\d{1,2})日");
        Matcher dateMatcher = datePattern.matcher(rawText);
        if (dateMatcher.find()) {
            String month = String.format("%02d", Integer.parseInt(dateMatcher.group(1)));
            String day = String.format("%02d", Integer.parseInt(dateMatcher.group(2)));
            item.setDate("2026-" + month + "-" + day);
        } else {
            // 2. 降级：根据"礼拜X"推断 2026 年 7 月日期
            // 2026-07 日历：周三=29、周四=30、周五=31；8 月：周六=1、周日=2...
            Matcher weekMatcher = Pattern.compile("礼\\s*拜\\s*([一二三四五六日天])").matcher(rawText);
            if (weekMatcher.find()) {
                String wk = weekMatcher.group(1);
                String date = switch (wk) {
                    case "三" -> "2026-07-29";
                    case "四" -> "2026-07-30";
                    case "五" -> "2026-07-31";
                    case "六" -> "2026-08-01";
                    case "日", "天" -> "2026-08-02";
                    case "一" -> "2026-08-03";
                    case "二" -> "2026-08-04";
                    default -> "";
                };
                if (!date.isEmpty()) {
                    item.setDate(date);
                    log.info("Fallback: 根据礼拜{}推断日期为 {}", wk, date);
                }
            }
        }

        // 3. 尝试提取经文出处：书卷名 + 章:节（支持 ~ - – 连接符）
        Pattern refPattern = Pattern.compile(
                "(创世记|出埃及记|利未记|民数记|申命记|约书亚记|士师记|路得记|撒母耳记上|撒母耳记下|"
                + "列王纪上|列王纪下|历代志上|历代志下|以斯拉记|尼希米记|以斯帖记|约伯记|诗篇|箴言|传道书|雅歌|"
                + "以赛亚书|耶利米书|耶利米哀歌|以西结书|但以理书|何西阿书|约珥书|阿摩司书|俄巴底亚书|约拿书|"
                + "弥迦书|那鸿书|哈巴谷书|西番雅书|哈该书|撒迦利亚书|玛拉基书|"
                + "马太福音|马可福音|路加福音|约翰福音|使徒行传|罗马书|哥林多前书|哥林多后书|加拉太书|"
                + "以弗所书|腓立比书|歌罗西书|帖撒罗尼迦前书|帖撒罗尼迦后书|提摩太前书|提摩太后书|提多书|腓利门书|"
                + "希伯来书|雅各书|彼得前书|彼得后书|约翰一书|约翰二书|约翰三书|犹大书|启示录)"
                + "\\s*(\\d+)\\s*[:：]\\s*(\\d+)\\s*[~\\-–—]\\s*(\\d+)");
        Matcher refMatcher = refPattern.matcher(rawText);
        if (refMatcher.find()) {
            String ref = refMatcher.group(1) + " " + refMatcher.group(2) + ":" + refMatcher.group(3) + "-" + refMatcher.group(4);
            item.setScriptureReference(ref);
            item.setTitle(ref);
            log.info("Fallback: 提取经文出处 {}", ref);
        }

        items.add(item);
        QtImportRequest request = new QtImportRequest();
        request.setItems(items);
        return request;
    }

    // ==================== 图片预处理 + Tesseract（降级用） ====================

    private Path preprocessImage(byte[] imageBytes) throws Exception {
        BufferedImage original = ImageIO.read(new java.io.ByteArrayInputStream(imageBytes));
        if (original == null) {
            throw new RuntimeException("无法读取图片文件，请检查图片格式");
        }
        // 放大提升小字识别率，但限制最大边长避免 Tesseract 处理过慢
        final int MAX_DIM = 3000;
        int ow = original.getWidth();
        int oh = original.getHeight();
        double scale = 3.0;
        if (ow * scale > MAX_DIM || oh * scale > MAX_DIM) {
            scale = (double) MAX_DIM / Math.max(ow, oh);
        }
        int newWidth = (int) (ow * scale);
        int newHeight = (int) (oh * scale);
        BufferedImage scaled = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = scaled.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.drawImage(original, 0, 0, newWidth, newHeight, null);
        g.dispose();
        // 保留 RGB（不做灰度化，彩色信息有助于 Tesseract 区分文字与背景）
        Path tempFile = Files.createTempFile("qt-ocr-", ".png");
        ImageIO.write(scaled, "png", tempFile.toFile());
        return tempFile;
    }

    private String runTesseract(Path imagePath) throws Exception {
        // --psm 3: 全自动版面分析，适合灵修图片的复杂排版（标题+经文+注释多区块）
        // --oem 1: 仅用 LSTM 神经网络引擎（比默认混合引擎快，中文识别也更好）
        List<String> command = new ArrayList<>();
        command.add("tesseract");
        command.add(imagePath.toString());
        command.add("stdout");
        command.add("-l");
        command.add("chi_sim+eng");
        command.add("--psm");
        command.add("3");
        command.add("--oem");
        command.add("1");

        log.info("Running Tesseract: {}", String.join(" ", command));
        ProcessBuilder pb = new ProcessBuilder(command);
        pb.redirectErrorStream(false);
        Process process = pb.start();

        StringBuilder output = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
        }
        StringBuilder error = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                error.append(line).append("\n");
            }
        }
        int exitCode = process.waitFor();
        if (exitCode != 0) {
            log.error("Tesseract failed with exit code {}: {}", exitCode, error);
            throw new RuntimeException("OCR 识别失败: " + error);
        }
        try {
            Files.deleteIfExists(imagePath);
        } catch (Exception ignored) {
        }
        return output.toString().trim();
    }

    private String getTextValue(JsonNode node, String field) {
        JsonNode valueNode = node.path(field);
        if (valueNode.isTextual()) {
            return valueNode.asText().trim();
        }
        return "";
    }
}
