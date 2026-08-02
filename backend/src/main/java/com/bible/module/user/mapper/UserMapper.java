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

    /** 全量用户（未软删除），按创建时间倒序 */
    java.util.List<User> findAll();

    int insert(User user);

    int update(User user);

    int updateStatus(UUID id, String status);

    int updateLastLogin(UUID id);

    /** 软删除：设置 deleted_at，保留数据可恢复 */
    int softDelete(UUID id);
}