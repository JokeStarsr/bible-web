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
                你是一个专业的 QT（Quiet Time）灵修内容解析助手。
                用户会给你一段从图片中 OCR 识别出来的文字，这些文字可能包含日期、标题、经文出处、经文正文、注释/默想散文、诗歌等内容。
                请从中提取结构化信息，返回 JSON 格式。

                注意事项：
                1. 日期格式统一为 yyyy-MM-dd（如 2026-07-27）。如果只有月日没有年份，默认年份为 2026。
                2. 标题是灵修内容的主题标题。
                3. scriptureReference 是经文出处，如 "罗马书 1:1-7"。
                4. scriptureText 是经文正文内容。
                5. commentary 是注释/默想散文/亮光等解释性内容。
                6. hymn 是诗歌内容（如有）。
                7. OCR 文字可能有错别字，请根据上下文智能修正明显的识别错误。
                8. 如果图片中包含多天的内容，请分别提取为多个 item。
                9. 如果某个字段确实无法识别，设为空字符串。

                【日期识别特别注意】
                - 经文出处如 "29:1~7"、"以西结书29:1~16" 中的数字是章节号，不是日期，切勿误认为日期。
                - 经文正文中出现的历史日期（如"第十年十月十二日"）是圣经历史事件日期，不是当日灵修日期。
                - 页码区出现的 "July 129"、"128" 等是书本页码，不是日期。
                - 真正的灵修日期通常出现在文本开头的"礼拜X"附近，或以"X月X日"、"MM-DD"等明文形式出现。
                - 如果文本中没有明文日期，请根据"礼拜X"配合日历推算（2026年7月：周三=7/29、周四=7/30、周五=7/31、周六=8/1、周日=8/2），或根据页码递增顺序推断。
                - 若实在无法确定日期，date 设为空字符串 ""，不要猜测。

                返回格式（纯 JSON，不要 markdown 标记）：
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

        String userPrompt = "以下是 OCR 识别的原始文字，请解析为结构化 QT 内容：\n\n" + rawText;

        try {
            String response = llmService.chat(systemPrompt, userPrompt);
            String json = llmService.extractJson(response);
            log.info("LLM parsed QT JSON (first 300): {}",
                    json != null && json.length() > 300 ? json.substring(0, 300) : json);
            return parseItemsFromJson(json);
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
        item.setDate("2026-07-27");
        item.setTitle("每日灵修");
        item.setScriptureReference("");
        item.setScriptureText(rawText);
        item.setCommentary("");
        item.setHymn("");

        Pattern datePattern = Pattern.compile("(\\d{1,2})月(\\d{1,2})日");
        Matcher dateMatcher = datePattern.matcher(rawText);
        if (dateMatcher.find()) {
            String month = String.format("%02d", Integer.parseInt(dateMatcher.group(1)));
            String day = String.format("%02d", Integer.parseInt(dateMatcher.group(2)));
            item.setDate("2026-" + month + "-" + day);
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
        // 放大 3 倍提升小字识别率
        int newWidth = original.getWidth() * 3;
        int newHeight = original.getHeight() * 3;
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
        List<String> command = new ArrayList<>();
        command.add("tesseract");
        command.add(imagePath.toString());
        command.add("stdout");
        command.add("-l");
        command.add("chi_sim+eng");
        command.add("--psm");
        command.add("3");

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
