package com.bible.module.qt.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class QtDailyContentResponse {
    private UUID id;
    private LocalDate qtDate;
    private String title;
    private String scriptureReference;
    private String scriptureText;
    private String commentary;
    private String hymn;
    private String scriptureTextKo;
    private String commentaryKo;
    private String hymnKo;
}
