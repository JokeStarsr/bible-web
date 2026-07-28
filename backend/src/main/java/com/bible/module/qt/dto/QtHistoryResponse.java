package com.bible.module.qt.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class QtHistoryResponse {
    private UUID qtContentId;
    private UUID responseId;
    private LocalDate qtDate;
    private String title;
    private String scriptureReference;
    private boolean responded;
    private String meditation;
    private String application;
    private String prayer;
}
