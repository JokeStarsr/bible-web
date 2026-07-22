# API 接口清单文档

## 1. 文档目标

本文档定义 MVP 阶段的主要接口清单、请求响应约定、鉴权规则与错误处理约定，作为前后端联调和后端开发依据。

## 2. 基础约定

### 2.1 基础路径

建议统一前缀：

`/api/v1`

### 2.2 响应格式

成功响应建议统一：

```json
{
  "success": true,
  "message": "ok",
  "data": {}
}
```

失败响应建议统一：

```json
{
  "success": false,
  "message": "参数错误",
  "errorCode": "VALIDATION_ERROR"
}
```

### 2.3 鉴权方式

首版建议：

1. Access Token
2. Refresh Token

说明：

1. 需要登录的接口必须在文档中明确标注。
2. 私有资源接口必须做用户归属校验。

### 2.4 分页格式

```json
{
  "success": true,
  "message": "ok",
  "data": {
    "items": [],
    "page": 1,
    "pageSize": 20,
    "total": 120
  }
}
```

## 3. 认证模块 API

### 3.1 发送注册邮箱验证码

`POST /auth/send-register-code`

是否需要登录：

1. 否

请求体：

```json
{
  "email": "user@example.com"
}
```

响应数据：

```json
{
  "success": true,
  "message": "验证码已发送",
  "data": {
    "expireSeconds": 300
  }
}
```

### 3.2 用户注册

`POST /auth/register`

请求体：

```json
{
  "username": "john",
  "email": "user@example.com",
  "password": "Pass1234!",
  "confirmPassword": "Pass1234!",
  "verificationCode": "123456"
}
```

响应数据：

```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "userId": "uuid"
  }
}
```

### 3.3 用户登录

`POST /auth/login`

请求体：

```json
{
  "email": "user@example.com",
  "password": "Pass1234!",
  "rememberMe": true
}
```

响应数据：

```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "accessToken": "token",
    "refreshToken": "token",
    "expiresIn": 7200,
    "user": {
      "id": "uuid",
      "username": "john",
      "displayName": "John"
    }
  }
}
```

### 3.4 刷新登录态

`POST /auth/refresh-token`

### 3.5 退出登录

`POST /auth/logout`

是否需要登录：

1. 是

### 3.6 发送找回密码验证码

`POST /auth/send-reset-code`

### 3.7 重置密码

`POST /auth/reset-password`

请求体：

```json
{
  "email": "user@example.com",
  "verificationCode": "123456",
  "newPassword": "NewPass123!",
  "confirmPassword": "NewPass123!"
}
```

### 3.8 修改密码

`POST /auth/change-password`

是否需要登录：

1. 是

## 4. 用户模块 API

### 4.1 获取当前用户信息

`GET /users/me`

### 4.2 更新当前用户资料

`PATCH /users/me`

请求体示例：

```json
{
  "displayName": "晨光",
  "bio": "愿主带领我每日灵修"
}
```

## 5. 经文模块 API

### 5.1 随机生成经文

`POST /scriptures/generate`

是否需要登录：

1. 是

请求体：

```json
{
  "generationType": "verse_7",
  "versionCode": "CUVS"
}
```

请求字段说明：

1. `generationType` 可选值：
   - `verse_1`
   - `verse_7`
   - `verse_12`
   - `verse_27`
   - `verse_39`
   - `chapter_full`
2. `versionCode` 首版可选，未传则使用默认译本

响应体：

```json
{
  "success": true,
  "message": "生成成功",
  "data": {
    "generationRecordId": "uuid",
    "referenceText": "约翰福音 3:16-22",
    "generationType": "verse_7",
    "verses": [
      {
        "bookName": "约翰福音",
        "chapterNumber": 3,
        "verseNumber": 16,
        "text": "神爱世人..."
      }
    ]
  }
}
```

### 5.2 获取某次生成记录详情

`GET /scriptures/generations/{generationRecordId}`

### 5.3 获取用户历史生成记录

`GET /scriptures/generations?page=1&pageSize=20`

## 6. 解经模块 API

### 6.1 获取当前经文解经内容

`POST /exegesis/generate`

是否需要登录：

1. 是

请求体：

```json
{
  "generationRecordId": "uuid"
}
```

响应体：

```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "exegesisRecordId": "uuid",
    "referenceText": "约翰福音 3:16-22",
    "summary": "这段经文集中表达...",
    "historicalBackground": "历史背景内容",
    "writingBackground": "写作背景内容",
    "contextAnalysis": "上下文分析内容",
    "keywordAnalysis": [
      {
        "keyword": "永生",
        "explanation": "解释说明"
      }
    ],
    "canonicalPosition": "在整本圣经中的位置",
    "theologicalTheme": "神学主题",
    "truthForPeople": "神借着经文向世人启示的真理",
    "practicalApplication": "对当代信徒的提醒"
  }
}
```

说明：

1. 如果已有缓存或已审核内容，则直接返回。
2. 如果调用 AI 生成较慢，可返回“生成中”状态，并通过轮询接口继续查询。

### 6.2 查询解经生成状态

`GET /exegesis/{exegesisRecordId}`

## 7. 标注模块 API

### 7.1 创建划线或标注

`POST /annotations`

请求体：

```json
{
  "generationRecordId": "uuid",
  "referenceText": "约翰福音 3:16-22",
  "bookId": "uuid",
  "startChapter": 3,
  "startVerse": 16,
  "endChapter": 3,
  "endVerse": 17,
  "selectedText": "神爱世人...",
  "highlightColor": "yellow",
  "noteContent": "这里特别提醒我神主动施恩"
}
```

### 7.2 获取我的标注列表

`GET /annotations?page=1&pageSize=20`

支持查询参数：

1. `referenceText`
2. `bookId`

### 7.3 更新标注

`PATCH /annotations/{annotationId}`

### 7.4 删除标注

`DELETE /annotations/{annotationId}`

## 8. 感悟模块 API

### 8.1 保存感悟草稿

`POST /reflections/draft`

请求体：

```json
{
  "generationRecordId": "uuid",
  "referenceText": "约翰福音 3:16-22",
  "title": "神爱世人的回应",
  "content": "今天我从这段经文里感受到...",
  "visibility": "private"
}
```

### 8.2 发布或更新感悟

`POST /reflections`

请求体：

```json
{
  "generationRecordId": "uuid",
  "referenceText": "约翰福音 3:16-22",
  "title": "神爱世人的回应",
  "content": "今天我从这段经文里感受到...",
  "visibility": "public"
}
```

### 8.3 获取我的感悟列表

`GET /reflections/mine?page=1&pageSize=20`

### 8.4 获取公开感悟流

`GET /reflections/public?page=1&pageSize=20`

### 8.5 获取感悟详情

`GET /reflections/{reflectionId}`

说明：

1. 私有感悟仅本人可访问。
2. 公开感悟可被登录用户查看。

### 8.6 删除感悟

`DELETE /reflections/{reflectionId}`

## 9. 评论与交流模块 API

### 9.1 创建评论

`POST /reflections/{reflectionId}/comments`

请求体：

```json
{
  "content": "这段经文也提醒我神的爱是主动的",
  "parentCommentId": null
}
```

### 9.2 获取评论列表

`GET /reflections/{reflectionId}/comments?page=1&pageSize=50`

### 9.3 删除评论

`DELETE /comments/{commentId}`

说明：

1. 只能删除自己的评论。
2. 管理员可后台删除违规评论。

### 9.4 查询私信解锁状态

`GET /reflections/{reflectionId}/message-unlocks`

响应示例：

```json
{
  "success": true,
  "message": "ok",
  "data": {
    "canUnlock": true,
    "roundCount": 20,
    "unlockStatus": "pending_acceptance"
  }
}
```

### 9.5 接受私信解锁

`POST /message-unlocks/{unlockId}/accept`

### 9.6 拒绝私信解锁

`POST /message-unlocks/{unlockId}/reject`

## 10. 私信模块 API

### 10.1 获取我的私信会话列表

`GET /messages/sessions?page=1&pageSize=20`

### 10.2 获取私信会话详情

`GET /messages/sessions/{sessionId}`

### 10.3 发送私信

`POST /messages/sessions/{sessionId}/messages`

请求体：

```json
{
  "content": "愿主继续带领我们在这段经文中成长"
}
```

### 10.4 获取消息列表

`GET /messages/sessions/{sessionId}/messages?page=1&pageSize=50`

### 10.5 关闭会话

`POST /messages/sessions/{sessionId}/close`

### 10.6 屏蔽会话

`POST /messages/sessions/{sessionId}/block`

## 11. 赞美播放模块 API

### 11.1 随机获取一首赞美

`GET /praise/random`

响应示例：

```json
{
  "success": true,
  "message": "ok",
  "data": {
    "trackId": "uuid",
    "title": "主爱长阔高深",
    "artistName": "某敬拜团队",
    "coverImageUrl": "https://example.com/cover.jpg",
    "audioUrl": "https://example.com/audio.mp3",
    "durationSeconds": 240,
    "loopSupported": true
  }
}
```

## 12. 举报与审核模块 API

### 12.1 提交举报

`POST /reports`

请求体：

```json
{
  "targetType": "reflection_comment",
  "targetId": "uuid",
  "reasonCode": "harassment",
  "reasonDetail": "存在持续骚扰内容"
}
```

## 13. 管理后台 API

### 13.1 获取用户列表

`GET /admin/users?page=1&pageSize=20`

### 13.2 更新用户状态

`PATCH /admin/users/{userId}/status`

### 13.3 获取举报列表

`GET /admin/reports?page=1&pageSize=20`

### 13.4 处理举报

`POST /admin/reports/{reportId}/handle`

### 13.5 获取公开内容列表

`GET /admin/content/reflections?page=1&pageSize=20`

### 13.6 隐藏公开内容

`POST /admin/content/reflections/{reflectionId}/hide`

### 13.7 获取赞美资源列表

`GET /admin/praise-tracks?page=1&pageSize=20`

### 13.8 新增赞美资源

`POST /admin/praise-tracks`

## 14. 错误码建议

1. `VALIDATION_ERROR`
2. `UNAUTHORIZED`
3. `FORBIDDEN`
4. `NOT_FOUND`
5. `EMAIL_ALREADY_EXISTS`
6. `USERNAME_ALREADY_EXISTS`
7. `INVALID_VERIFICATION_CODE`
8. `PASSWORD_TOO_WEAK`
9. `SCRIPTURE_GENERATION_FAILED`
10. `EXEGESIS_GENERATION_FAILED`
11. `REFLECTION_NOT_PUBLIC`
12. `MESSAGE_UNLOCK_NOT_AVAILABLE`
13. `SESSION_CLOSED`
14. `RATE_LIMITED`
15. `CONTENT_BLOCKED`

## 15. 接口优先级

### P0

1. 认证模块接口
2. 用户基本资料接口
3. 随机经文生成接口
4. 解经接口

### P1

1. 标注接口
2. 感悟接口
3. 评论与交流接口
4. 私信接口
5. 赞美随机接口

### P2

1. 举报接口
2. 管理后台接口

## 16. 联调验收标准

1. 所有接口返回结构统一。
2. 鉴权接口和私有资源接口权限正确。
3. 随机经文、解经、感悟、交流、私信、赞美主链路可以串通。
4. 错误码与前端提示文案可一一对应。
