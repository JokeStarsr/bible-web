package com.bible.module.reflection.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateReflectionRequest {

    private String generationRecordId;

    @NotBlank(message = "经文引用不能为空")
    private String referenceText;

    private String title;

    @NotBlank(message = "感悟内容不能为空")
    private String content;

    /** private | public */
    private String visibility = "private";
}
