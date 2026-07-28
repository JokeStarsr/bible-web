package com.bible.module.qt.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class QtImportRequest {
    @NotEmpty
    private List<QtImportItem> items;

    @Data
    public static class QtImportItem {
        @NotEmpty
        private String date; // yyyy-MM-dd
        @NotEmpty
        private String title;
        private String scriptureReference;
        @NotEmpty
        private String scriptureText;
        private String commentary;
        private String hymn;
    }
}
