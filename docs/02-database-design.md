# 数据库表设计文档

## 1. 文档目标

本文档基于 `README.md` 与 `docs/01-system-architecture.md`，定义 MVP 阶段数据库设计建议，供后续 ORM 建模、SQL 迁移、后端接口开发和数据校验使用。

## 2. 数据库选型建议

推荐使用：

1. PostgreSQL 作为主数据库
2. Redis 作为缓存、验证码、限流与临时令牌存储

说明：

1. 本文档主要描述关系型数据库表结构。
2. Redis 键设计作为补充说明，不作为主表结构的一部分。

## 3. 设计原则

1. 优先覆盖 MVP 主链路。
2. 保留后续多译本、收藏、每日计划等扩展空间。
3. 对私有内容和公开内容采用清晰的状态字段。
4. 对评论、私信、举报、审核等内容保留审计和追踪字段。
5. 所有核心表建议保留 `created_at` 和 `updated_at`。

## 4. 命名约定

### 4.1 通用字段

建议统一采用以下字段：

1. `id`：主键，建议使用 UUID
2. `created_at`
3. `updated_at`
4. `deleted_at`：如需要软删除

### 4.2 状态字段命名

1. `status`
2. `visibility`
3. `is_active`
4. `is_verified`
5. `is_locked`

## 5. 核心表设计

### 5.1 `users`

用途：

1. 存储用户基础资料

字段建议：

1. `id` UUID PK
2. `username` VARCHAR(50) UNIQUE NOT NULL
3. `email` VARCHAR(255) UNIQUE NOT NULL
4. `display_name` VARCHAR(100) NULL
5. `avatar_url` TEXT NULL
6. `bio` TEXT NULL
7. `status` VARCHAR(20) NOT NULL
8. `email_verified_at` TIMESTAMP NULL
9. `last_login_at` TIMESTAMP NULL
10. `created_at` TIMESTAMP NOT NULL
11. `updated_at` TIMESTAMP NOT NULL
12. `deleted_at` TIMESTAMP NULL

状态建议：

1. `active`
2. `suspended`
3. `disabled`

索引建议：

1. `username`
2. `email`
3. `status`

### 5.2 `auth_credentials`

用途：

1. 存储密码哈希和认证信息

字段建议：

1. `id` UUID PK
2. `user_id` UUID FK -> users.id
3. `password_hash` TEXT NOT NULL
4. `password_updated_at` TIMESTAMP NOT NULL
5. `failed_login_count` INTEGER NOT NULL DEFAULT 0
6. `locked_until` TIMESTAMP NULL
7. `created_at` TIMESTAMP NOT NULL
8. `updated_at` TIMESTAMP NOT NULL

约束建议：

1. `user_id` 唯一，确保一名用户一条主认证记录

### 5.3 `password_reset_tokens`

用途：

1. 存储找回密码令牌或验证码记录

字段建议：

1. `id` UUID PK
2. `user_id` UUID FK -> users.id
3. `token` VARCHAR(255) NOT NULL
4. `expires_at` TIMESTAMP NOT NULL
5. `used_at` TIMESTAMP NULL
6. `created_at` TIMESTAMP NOT NULL

索引建议：

1. `user_id`
2. `token`
3. `expires_at`

### 5.4 `email_verification_tokens`

用途：

1. 存储邮箱验证令牌或验证码

字段建议：

1. `id` UUID PK
2. `user_id` UUID FK -> users.id
3. `email` VARCHAR(255) NOT NULL
4. `token` VARCHAR(255) NOT NULL
5. `expires_at` TIMESTAMP NOT NULL
6. `verified_at` TIMESTAMP NULL
7. `created_at` TIMESTAMP NOT NULL

### 5.5 `bible_versions`

用途：

1. 存储圣经版本信息

字段建议：

1. `id` UUID PK
2. `code` VARCHAR(50) UNIQUE NOT NULL
3. `name` VARCHAR(100) NOT NULL
4. `language` VARCHAR(20) NOT NULL
5. `copyright_notice` TEXT NULL
6. `is_default` BOOLEAN NOT NULL DEFAULT FALSE
7. `status` VARCHAR(20) NOT NULL
8. `created_at` TIMESTAMP NOT NULL
9. `updated_at` TIMESTAMP NOT NULL

### 5.6 `bible_books`

用途：

1. 存储卷信息

字段建议：

1. `id` UUID PK
2. `version_id` UUID FK -> bible_versions.id
3. `book_order` INTEGER NOT NULL
4. `book_code` VARCHAR(20) NOT NULL
5. `book_name_zh` VARCHAR(50) NOT NULL
6. `book_name_en` VARCHAR(50) NULL
7. `testament` VARCHAR(10) NOT NULL
8. `chapter_count` INTEGER NOT NULL
9. `created_at` TIMESTAMP NOT NULL
10. `updated_at` TIMESTAMP NOT NULL

索引建议：

1. `(version_id, book_order)`
2. `(version_id, book_code)`

### 5.7 `bible_verses`

用途：

1. 存储结构化经文正文

字段建议：

1. `id` UUID PK
2. `version_id` UUID FK -> bible_versions.id
3. `book_id` UUID FK -> bible_books.id
4. `chapter_number` INTEGER NOT NULL
5. `verse_number` INTEGER NOT NULL
6. `verse_text` TEXT NOT NULL
7. `created_at` TIMESTAMP NOT NULL
8. `updated_at` TIMESTAMP NOT NULL

唯一约束建议：

1. `(version_id, book_id, chapter_number, verse_number)`

索引建议：

1. `(book_id, chapter_number, verse_number)`
2. `(version_id, book_id, chapter_number)`

### 5.8 `scripture_generation_records`

用途：

1. 记录用户每次随机生成经文的行为

字段建议：

1. `id` UUID PK
2. `user_id` UUID FK -> users.id
3. `version_id` UUID FK -> bible_versions.id
4. `generation_type` VARCHAR(20) NOT NULL
5. `book_id` UUID FK -> bible_books.id
6. `start_chapter` INTEGER NOT NULL
7. `start_verse` INTEGER NULL
8. `end_chapter` INTEGER NOT NULL
9. `end_verse` INTEGER NULL
10. `reference_text` VARCHAR(255) NOT NULL
11. `verse_count` INTEGER NOT NULL
12. `created_at` TIMESTAMP NOT NULL

说明：

1. `generation_type` 可取值：`verse_1`、`verse_7`、`verse_12`、`verse_27`、`verse_39`、`chapter_full`

### 5.9 `exegesis_records`

用途：

1. 存储解经结果
2. 支持缓存、人工审核与版本管理

字段建议：

1. `id` UUID PK
2. `generation_record_id` UUID FK -> scripture_generation_records.id NULL
3. `version_id` UUID FK -> bible_versions.id
4. `reference_text` VARCHAR(255) NOT NULL
5. `source_type` VARCHAR(20) NOT NULL
6. `summary` TEXT NOT NULL
7. `historical_background` TEXT NOT NULL
8. `writing_background` TEXT NOT NULL
9. `context_analysis` TEXT NOT NULL
10. `keyword_analysis` JSONB NULL
11. `canonical_position` TEXT NOT NULL
12. `theological_theme` TEXT NOT NULL
13. `truth_for_people` TEXT NOT NULL
14. `practical_application` TEXT NOT NULL
15. `reference_sources` JSONB NULL
16. `status` VARCHAR(20) NOT NULL
17. `ai_model_name` VARCHAR(100) NULL
18. `prompt_version` VARCHAR(50) NULL
19. `reviewed_by` UUID NULL
20. `reviewed_at` TIMESTAMP NULL
21. `created_at` TIMESTAMP NOT NULL
22. `updated_at` TIMESTAMP NOT NULL

状态建议：

1. `generated`
2. `review_pending`
3. `approved`
4. `rejected`

### 5.10 `highlight_notes`

用途：

1. 存储用户对经文的划线和片段备注

字段建议：

1. `id` UUID PK
2. `user_id` UUID FK -> users.id
3. `generation_record_id` UUID FK -> scripture_generation_records.id NULL
4. `reference_text` VARCHAR(255) NOT NULL
5. `book_id` UUID FK -> bible_books.id
6. `start_chapter` INTEGER NOT NULL
7. `start_verse` INTEGER NOT NULL
8. `end_chapter` INTEGER NOT NULL
9. `end_verse` INTEGER NOT NULL
10. `selected_text` TEXT NOT NULL
11. `highlight_color` VARCHAR(20) NOT NULL
12. `note_content` TEXT NULL
13. `created_at` TIMESTAMP NOT NULL
14. `updated_at` TIMESTAMP NOT NULL
15. `deleted_at` TIMESTAMP NULL

### 5.11 `reflections`

用途：

1. 存储用户感悟内容

字段建议：

1. `id` UUID PK
2. `user_id` UUID FK -> users.id
3. `generation_record_id` UUID FK -> scripture_generation_records.id NULL
4. `reference_text` VARCHAR(255) NOT NULL
5. `title` VARCHAR(200) NULL
6. `content` TEXT NOT NULL
7. `visibility` VARCHAR(20) NOT NULL
8. `status` VARCHAR(20) NOT NULL
9. `draft_saved_at` TIMESTAMP NULL
10. `published_at` TIMESTAMP NULL
11. `comment_count` INTEGER NOT NULL DEFAULT 0
12. `like_count` INTEGER NOT NULL DEFAULT 0
13. `created_at` TIMESTAMP NOT NULL
14. `updated_at` TIMESTAMP NOT NULL
15. `deleted_at` TIMESTAMP NULL

可见性建议：

1. `private`
2. `public`

状态建议：

1. `draft`
2. `published`
3. `hidden`
4. `archived`

索引建议：

1. `(user_id, visibility, status)`
2. `(visibility, status, published_at)`

### 5.12 `reflection_comments`

用途：

1. 存储公开感悟下的评论和交流

字段建议：

1. `id` UUID PK
2. `reflection_id` UUID FK -> reflections.id
3. `user_id` UUID FK -> users.id
4. `parent_comment_id` UUID FK -> reflection_comments.id NULL
5. `root_comment_id` UUID FK -> reflection_comments.id NULL
6. `content` TEXT NOT NULL
7. `status` VARCHAR(20) NOT NULL
8. `interaction_round_seq` INTEGER NULL
9. `created_at` TIMESTAMP NOT NULL
10. `updated_at` TIMESTAMP NOT NULL
11. `deleted_at` TIMESTAMP NULL

说明：

1. 若首版不做复杂楼中楼，可只支持一级评论和回复。
2. `interaction_round_seq` 用于辅助统计交流轮次。

### 5.13 `message_unlocks`

用途：

1. 存储因公开交流达标而解锁的私信资格

字段建议：

1. `id` UUID PK
2. `reflection_id` UUID FK -> reflections.id
3. `user_a_id` UUID FK -> users.id
4. `user_b_id` UUID FK -> users.id
5. `trigger_comment_id` UUID FK -> reflection_comments.id NULL
6. `trigger_round_count` INTEGER NOT NULL
7. `status` VARCHAR(20) NOT NULL
8. `unlocked_at` TIMESTAMP NOT NULL
9. `expires_at` TIMESTAMP NULL
10. `created_at` TIMESTAMP NOT NULL
11. `updated_at` TIMESTAMP NOT NULL

状态建议：

1. `pending_acceptance`
2. `accepted`
3. `rejected`
4. `expired`

唯一约束建议：

1. `(reflection_id, user_a_id, user_b_id)`

### 5.14 `private_message_sessions`

用途：

1. 私信会话

字段建议：

1. `id` UUID PK
2. `unlock_id` UUID FK -> message_unlocks.id
3. `user_a_id` UUID FK -> users.id
4. `user_b_id` UUID FK -> users.id
5. `status` VARCHAR(20) NOT NULL
6. `last_message_at` TIMESTAMP NULL
7. `created_at` TIMESTAMP NOT NULL
8. `updated_at` TIMESTAMP NOT NULL

状态建议：

1. `active`
2. `closed`
3. `blocked`

### 5.15 `private_messages`

用途：

1. 私信消息正文

字段建议：

1. `id` UUID PK
2. `session_id` UUID FK -> private_message_sessions.id
3. `sender_id` UUID FK -> users.id
4. `content` TEXT NOT NULL
5. `status` VARCHAR(20) NOT NULL
6. `read_at` TIMESTAMP NULL
7. `created_at` TIMESTAMP NOT NULL
8. `updated_at` TIMESTAMP NOT NULL
9. `deleted_at` TIMESTAMP NULL

状态建议：

1. `sent`
2. `read`
3. `hidden`

### 5.16 `praise_tracks`

用途：

1. 存储赞美播放资源

字段建议：

1. `id` UUID PK
2. `title` VARCHAR(255) NOT NULL
3. `artist_name` VARCHAR(255) NULL
4. `cover_image_url` TEXT NULL
5. `audio_url` TEXT NOT NULL
6. `duration_seconds` INTEGER NULL
7. `source_type` VARCHAR(20) NOT NULL
8. `copyright_note` TEXT NULL
9. `status` VARCHAR(20) NOT NULL
10. `created_at` TIMESTAMP NOT NULL
11. `updated_at` TIMESTAMP NOT NULL

状态建议：

1. `active`
2. `inactive`

### 5.17 `reports`

用途：

1. 存储用户举报

字段建议：

1. `id` UUID PK
2. `reporter_id` UUID FK -> users.id
3. `target_type` VARCHAR(30) NOT NULL
4. `target_id` UUID NOT NULL
5. `reason_code` VARCHAR(30) NOT NULL
6. `reason_detail` TEXT NULL
7. `status` VARCHAR(20) NOT NULL
8. `handled_by` UUID NULL
9. `handled_at` TIMESTAMP NULL
10. `created_at` TIMESTAMP NOT NULL
11. `updated_at` TIMESTAMP NOT NULL

### 5.18 `admin_action_logs`

用途：

1. 记录管理员操作审计

字段建议：

1. `id` UUID PK
2. `admin_user_id` UUID FK -> users.id
3. `action_type` VARCHAR(50) NOT NULL
4. `target_type` VARCHAR(30) NOT NULL
5. `target_id` UUID NULL
6. `action_detail` JSONB NULL
7. `created_at` TIMESTAMP NOT NULL

## 6. 关键关系说明

1. `users` 与 `auth_credentials` 为一对一关系。
2. `users` 与 `scripture_generation_records` 为一对多关系。
3. `scripture_generation_records` 与 `exegesis_records` 为一对多或一对一扩展关系。
4. `users` 与 `highlight_notes` 为一对多关系。
5. `users` 与 `reflections` 为一对多关系。
6. `reflections` 与 `reflection_comments` 为一对多关系。
7. `message_unlocks` 是公开交流触发私信的中间凭证。
8. `private_message_sessions` 与 `private_messages` 为一对多关系。

## 7. 交流轮次统计建议

“20 轮交流”属于业务规则重点，建议先采用如下可实现方案：

1. 仅统计公开感悟详情页下楼主与某一名用户之间的往返互动。
2. 当双方交替回复时，每形成一次双方往返记为 1 轮。
3. 系统在评论写入后异步计算该对用户的累计有效轮次。
4. 达到 20 轮后创建一条 `message_unlocks` 记录。

说明：

1. 正式开发前，产品负责人必须最终确认规则。
2. 如果首版想降低复杂度，也可以暂定“累计有效双向回复数 >= 40 条”近似为 20 轮。

## 8. Redis 键设计建议

### 8.1 验证码

1. `email_verify:{email}`
2. `password_reset:{email}`

### 8.2 限流

1. `login_fail:{email}`
2. `send_code_limit:{email}`
3. `ip_rate_limit:{ip}:{route}`

### 8.3 解经缓存

1. `exegesis:{version}:{reference_hash}`

## 9. 索引与性能建议

1. 高频查询字段必须建索引，如邮箱、用户名、经文定位、发布时间。
2. 评论列表需对 `reflection_id + created_at` 建索引。
3. 私信消息列表需对 `session_id + created_at` 建索引。
4. 公开感悟流需对 `visibility + status + published_at` 建索引。

## 10. 数据安全建议

1. 密码只存哈希值。
2. 敏感操作记录审计日志。
3. 私有感悟、私信必须通过用户 ID 做权限校验。
4. 对软删除内容保留管理审计能力。

## 11. 首版建表优先级

### P0

1. `users`
2. `auth_credentials`
3. `password_reset_tokens`
4. `email_verification_tokens`
5. `bible_versions`
6. `bible_books`
7. `bible_verses`
8. `scripture_generation_records`
9. `exegesis_records`

### P1

1. `highlight_notes`
2. `reflections`
3. `reflection_comments`
4. `message_unlocks`
5. `private_message_sessions`
6. `private_messages`
7. `praise_tracks`

### P2

1. `reports`
2. `admin_action_logs`

## 12. 建表验收标准

1. 能覆盖 MVP 全部业务流程。
2. 表之间关系清晰，外键合理。
3. 状态字段足以支持公开、私有、审核、解锁等业务。
4. 不会阻碍后续增加收藏、主题经文和多译本功能。
