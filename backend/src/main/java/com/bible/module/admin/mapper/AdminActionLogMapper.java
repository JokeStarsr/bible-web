package com.bible.module.admin.mapper;

import com.bible.module.admin.entity.AdminActionLog;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.UUID;

@Mapper
public interface AdminActionLogMapper {

    int insert(AdminActionLog adminActionLog);

    List<AdminActionLog> findByAdminUserId(UUID adminUserId, int offset, int limit);

    long countByAdminUserId(UUID adminUserId);
}