package com.bible.module.courtship.dto;

import lombok.Data;

/**
 * 提交见证请求
 */
@Data
public class WitnessRequest {

    private String title;
    private String content;
    private String photoUrl;
}
