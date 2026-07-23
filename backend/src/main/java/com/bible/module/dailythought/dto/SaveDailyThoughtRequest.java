package com.bible.module.dailythought.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class SaveDailyThoughtRequest {

    @NotBlank(message = "随想内容不能为空")
    @Size(max = 2000, message = "随想内容不能超过2000字")
    private String content;

    private String pastoralResponse;

    private String divineWord;

    @NotNull(message = "经文列表不能为空")
    private List<DailyThoughtResponse.ScriptureMatch> scriptures;
}
