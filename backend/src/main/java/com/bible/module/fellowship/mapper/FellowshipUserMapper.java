package com.bible.module.fellowship.mapper;

import com.bible.module.user.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

/**
 * 主内通讯模块对 users 表的自定义查询（模糊搜索）。
 * 单个用户查询复用 UserMapper。
 */
@Mapper
public interface FellowshipUserMapper {

    /** 按 username/displayName/email 模糊搜索，排除自己 */
    List<User> searchByKeyword(@Param("excludeUserId") UUID excludeUserId,
                               @Param("keyword") String keyword,
                               @Param("limit") int limit);
}
