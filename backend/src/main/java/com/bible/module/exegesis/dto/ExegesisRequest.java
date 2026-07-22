package com.bible.module.exegesis.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class ExegesisRequest {

    @NotNull(message = "生成记录ID不能为空")
    private UUID generationRecordId;
}