package com.bible.module.user.mapper;

import com.bible.module.user.entity.User;
import org.apache.ibatis.annotations.Mapper;

import java.util.UUID;

@Mapper
public interface UserMapper {

    User findById(UUID id);

    User findByUsername(String username);

    User findByEmail(String email);

    User findByOpenid(String openid);

    int insert(User user);

    int update(User user);

    int updateStatus(UUID id, String status);

    int updateLastLogin(UUID id);
}