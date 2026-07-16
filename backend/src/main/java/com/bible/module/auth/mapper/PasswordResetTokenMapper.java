package com.bible.module.auth.mapper;

import com.bible.module.auth.entity.PasswordResetToken;
import org.apache.ibatis.annotations.Mapper;

import java.util.UUID;

@Mapper
public interface PasswordResetTokenMapper {

    int insert(PasswordResetToken passwordResetToken);

    PasswordResetToken findByToken(String token);

    int markUsed(UUID id);
}