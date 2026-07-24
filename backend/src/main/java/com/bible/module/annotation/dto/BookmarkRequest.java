package com.bible.module.annotation.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class BookmarkRequest {

    @NotNull(message = "圣经版本不能为空")
    private UUID versionId;

    @NotNull(message = "书卷不能为空")
    private UUID bookId;

    @NotNull(message = "章数不能为空")
    private Integer chapterNumber;

    @NotNull(message = "节数不能为空")
    private Integer verseNumber;
}
