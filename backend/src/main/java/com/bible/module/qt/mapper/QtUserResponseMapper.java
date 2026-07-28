package com.bible.module.qt.mapper;

import com.bible.module.qt.dto.QtAllResponseDTO;
import com.bible.module.qt.entity.QtUserResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

@Mapper
public interface QtUserResponseMapper {
    QtUserResponse findByUserAndContent(@Param("userId") UUID userId, @Param("qtContentId") UUID qtContentId);
    List<QtUserResponse> findByContentId(@Param("qtContentId") UUID qtContentId);
    QtUserResponse findById(@Param("id") UUID id);
    void insert(QtUserResponse response);
    void update(QtUserResponse response);
    List<QtUserResponse> findUserHistory(@Param("userId") UUID userId, @Param("offset") int offset, @Param("size") int size);
    int countUserHistory(@Param("userId") UUID userId);
    void deleteById(@Param("id") UUID id);

    /** 查询所有用户的回应（JOIN users + qt_daily_contents），按创建时间倒序 */
    List<QtAllResponseDTO> findAllResponses();
}