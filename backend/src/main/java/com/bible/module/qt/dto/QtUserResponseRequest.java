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
    /** 可见范围：PUBLIC=可共享（其他用户可见），PRIVATE=仅自己看见；为空时默认 PUBLIC */
    private String visibility;
}
