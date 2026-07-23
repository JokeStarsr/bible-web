package com.bible.module.dailythought.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class DailyThoughtResponse {

    /**
     * 对用户随想的牧养性回应
     */
    private String pastoralResponse;

    /**
     * 推荐的经文列表
     */
    private List<ScriptureMatch> scriptures;

    /**
     * 神的安慰/提醒/引导话语总结
     */
    private String divineWord;

    @Data
    @Builder
    public static class ScriptureMatch {
        /**
         * 经文引用，如 诗篇 23:1-3
         */
        private String reference;

        /**
         * 经文内容
         */
        private String text;

        /**
         * 这段经文与用户随想的关联说明
         */
        private String relevance;
    }
}
