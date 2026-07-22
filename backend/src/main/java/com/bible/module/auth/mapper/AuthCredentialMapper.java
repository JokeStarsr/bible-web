package com.bible.module.auth.mapper;

import com.bible.module.auth.entity.AuthCredential;
import org.apache.ibatis.annotations.Mapper;

import java.time.LocalDateTime;
import java.util.UUID;

@Mapper
public interface AuthCredentialMapper {

    AuthCredential findByUserId(UUID userId);

    int insert(AuthCredential authCredential);

    int update(AuthCredential authCredential);

    int updatePassword(UUID userId, String passwordHash, LocalDateTime now);
}