package com.bible.module.annotation.dto;

import lombok.Data;

@Data
public class UpdateAnnotationRequest {

    private String noteContent;

    /** private | public */
    private String visibility;
}
