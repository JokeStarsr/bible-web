package com.bible.module.auth.mapper;

import com.bible.module.auth.entity.EmailVerificationToken;
import org.apache.ibatis.annotations.Mapper;

import java.util.UUID;

@Mapper
public interface EmailVerificationTokenMapper {

    int insert(EmailVerificationToken emailVerificationToken);

    EmailVerificationToken findByToken(String token);

    int markVerified(UUID id);
}