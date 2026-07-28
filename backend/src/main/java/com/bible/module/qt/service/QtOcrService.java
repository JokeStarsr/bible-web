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
import java.io.File;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * QT 图片 OCR 识别服务
 * 1. 用 Tesseract OCR 从图片中提取原始文字（中英文）
 * 2. 用 DeepSeek LLM 将原始文字解析为结构化 QT 内容
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class QtOcrService {

    private final LlmService llmService;
    private final ObjectMapper objectMapper;

    private static final String ADMIN_EMAIL = "852341467@qq.com";

    /**
     * 从上传的图片中识别 QT 灵修内容
     *
     * @param file 图片文件
     * @return 解析后的 QT 导入请求
     */
    public QtImportRequest recognizeFromImage(MultipartFile file) throws Exception {
        // 1. 预处理图片：放大 + 灰度化，提升 OCR 精度
        Path processedPath = preprocessImage(file);

        // 2. 调用 Tesseract OCR 提取文字
        String rawText = runTesseract(processedPath);
        log.info("OCR raw text length={}, first 200 chars: {}", rawText.length(),
                rawText.length() > 200 ? rawText.substring(0, 200) : rawText);

        if (rawText == null || rawText.isBlank()) {
            throw new RuntimeException("图片中未识别到任何文字，请确保图片清晰");
        }

        // 3. 用 LLM 解析为结构化数据
        QtImportRequest result = parseWithLlm(rawText);
        if (result == null || result.getItems() == null || result.getItems().isEmpty()) {
            throw new RuntimeException("无法从识别文字中解析出 QT 内容，请检查图片格式");
        }

        return result;
    }

    /**
     * 预处理图片：放大 2 倍 + 灰度化，提升 OCR 精度
     */
    private Path preprocessImage(MultipartFile file) throws Exception {
        BufferedImage original = ImageIO.read(file.getInputStream());
        if (original == null) {
            throw new RuntimeException("无法读取图片文件，请检查图片格式");
        }

        // 放大 2 倍
        int newWidth = original.getWidth() * 2;
        int newHeight = original.getHeight() * 2;
        BufferedImage scaled = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = scaled.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.drawImage(original, 0, 0, newWidth, newHeight, null);
        g.dispose();

        // 灰度化
        BufferedImage gray = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_BYTE_GRAY);
        Graphics2D g2 = gray.createGraphics();
        g2.drawImage(scaled, 0, 0, null);
        g2.dispose();

        // 保存为临时文件
        Path tempFile = Files.createTempFile("qt-ocr-", ".png");
        ImageIO.write(gray, "png", tempFile.toFile());
        return tempFile;
    }

    /**
     * 调用 Tesseract OCR 命令行工具识别图片文字
     */
    private String runTesseract(Path imagePath) throws Exception {
        List<String> command = new ArrayList<>();
        command.add("tesseract");
        command.add(imagePath.toString());
        command.add("stdout");
        command.add("-l");
        command.add("chi_sim+eng");
        command.add("--psm");
        command.add("6"); // Assume a uniform block of text

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

        // 清理临时文件
        try {
            Files.deleteIfExists(imagePath);
        } catch (Exception ignored) {
        }

        return output.toString().trim();
    }

    /**
     * 用 DeepSeek LLM 将 OCR 原始文字解析为结构化 QT 内容
     */
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
            log.info("LLM parsed QT JSON: {}", json);

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

                // 跳过无效条目
                if (item.getDate().isEmpty() || item.getScriptureText().isEmpty()) {
                    continue;
                }

                items.add(item);
            }

            request.setItems(items);
            return request;
        } catch (Exception e) {
            log.error("LLM parsing failed", e);
            // 降级：尝试用正则解析
            return fallbackParse(rawText);
        }
    }

    /**
     * 降级解析：当 LLM 不可用时，用正则表达式尝试提取
     */
    private QtImportRequest fallbackParse(String rawText) {
        log.info("Using fallback regex parsing");
        List<QtImportRequest.QtImportItem> items = new ArrayList<>();

        // 尝试提取日期
        Pattern datePattern = Pattern.compile("(\\d{1,2})月(\\d{1,2})日");
        Matcher dateMatcher = datePattern.matcher(rawText);

        QtImportRequest.QtImportItem item = new QtImportRequest.QtImportItem();
        item.setDate("2026-07-27"); // 默认值
        item.setTitle("每日灵修");
        item.setScriptureReference("");
        item.setScriptureText(rawText);
        item.setCommentary("");
        item.setHymn("");

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

    private String getTextValue(JsonNode node, String field) {
        JsonNode valueNode = node.path(field);
        if (valueNode.isTextual()) {
            return valueNode.asText().trim();
        }
        return "";
    }
}
