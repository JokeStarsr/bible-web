package com.bible.module.messaging.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateSessionRequest {

    @NotNull(message = "对方用户不能为空")
    private UUID userId;
}
