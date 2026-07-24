package com.bible.module.annotation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateAnnotationRequest {

    @NotBlank(message = "经文引用不能为空")
    private String referenceText;

    @NotNull(message = "圣经版本不能为空")
    private UUID versionId;

    @NotNull(message = "书卷不能为空")
    private UUID bookId;

    @NotNull(message = "章数不能为空")
    private Integer chapterNumber;

    @NotNull(message = "起始节不能为空")
    private Integer startVerse;

    @NotNull(message = "结束节不能为空")
    private Integer endVerse;

    private String selectedText;

    private String noteContent;

    /** private | public */
    private String visibility = "private";
}
