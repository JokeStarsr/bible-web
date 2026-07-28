package com.bible.module.qt.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class QtUserResponseRequest {
    @NotNull
    private UUID qtContentId;
    private String meditation;
    private String application;
    private String prayer;
    private List<String> photos;
}
