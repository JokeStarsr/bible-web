package com.bible.module.dailythought.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DailyThoughtRequest {

    @NotBlank(message = "请写下你的今日随想")
    @Size(max = 2000, message = "随想内容不能超过2000字")
    private String content;
}
