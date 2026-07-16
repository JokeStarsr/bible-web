package com.bible.module.scripture.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GenerateScriptureRequest {

    @NotBlank(message = "生成类型不能为空")
    private String generationType;

    private String versionCode;
}