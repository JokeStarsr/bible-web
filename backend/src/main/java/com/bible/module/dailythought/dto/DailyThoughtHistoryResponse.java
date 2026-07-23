package com.bible.module.dailythought.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class DailyThoughtHistoryResponse {

    private UUID id;
    private String content;
    private String pastoralResponse;
    private String divineWord;
    private List<DailyThoughtResponse.ScriptureMatch> scriptures;
    private LocalDateTime createdAt;
}
