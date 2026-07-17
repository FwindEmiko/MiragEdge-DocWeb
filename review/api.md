# 审核系统接口文档

本文档详细描述新玩家审核系统的所有API接口，供后端开发使用。

## 目录

- [基础信息](#基础信息)
- [验证码接口](#验证码接口)
- [用户认证接口](#用户认证接口)
- [审核题目接口](#审核题目接口)
- [提交审核接口](#提交审核接口)
- [审核结果查询接口](#审核结果查询接口)
- [QQ机器人接口](#qq机器人接口)
- [数据模型](#数据模型)

---

## 基础信息

### 环境配置

| 环境 | 域名 | 备注 |
|------|------|------|
| 开发 | `http://localhost:3000` | 本地开发 |
| 测试 | `https://test-api.miragedge.top` | 测试环境 |
| 生产 | `https://api.miragedge.top` | 生产环境 |

### 通用响应格式

```typescript
// 成功响应
interface ApiResponse<T> {
  code: number;      // 状态码 (200 = 成功)
  message: string;   // 响应信息
  data: T;          // 响应数据
  timestamp: number; // 时间戳
}

// 失败响应
interface ApiError {
  code: number;      // 错误码
  message: string;   // 错误信息
  details?: string;  // 详细错误信息
}
```

### 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权/登录失效 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

---

## 验证码接口

### 发送验证码

```
POST /api/auth/verification/send
```

**请求头**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Content-Type | string | 是 | application/json |

**请求体**

```json
{
  "qq": "1234567890",
  "type": "bind"  // bind: 绑定QQ, reset: 重置绑定
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "验证码已发送",
  "data": {
    "qq": "1234567890",
    "expiredAt": "2024-01-15T10:05:00Z",
    "ttl": 300
  },
  "timestamp": 1705310700000
}
```

**验证规则**

- QQ号：5-11位数字
- 验证码：6位数字
- 有效期：5分钟
- 发送间隔：60秒（同一QQ号）
- 每个QQ号每天最多发送10次

---

## 用户认证接口

### QQ绑定/登录

```
POST /api/auth/qq/bind
```

**请求体**

```json
{
  "qq": "1234567890",
  "code": "123456",
  "mcUsername": "PlayerName"  // 可选，MC游戏ID
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "绑定成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "usr_abc123",
      "qq": "1234567890",
      "mcUsername": "PlayerName",
      "bindTime": "2024-01-15T10:00:00Z",
      "reviewCount": 0
    },
    "expiresIn": 2592000
  },
  "timestamp": 1705310700000
}
```

### 获取用户信息

```
GET /api/auth/user/info
```

**请求头**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Authorization | string | 是 | Bearer Token |

**响应示例**

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": "usr_abc123",
    "qq": "1234567890",
    "mcUsername": "PlayerName",
    "bindTime": "2024-01-15T10:00:00Z",
    "reviewCount": 1,
    "lastReviewTime": "2024-01-15T10:10:00Z",
    "reviewStatus": "passed"  // pending/passed/failed
  },
  "timestamp": 1705310700000
}
```

### 刷新Token

```
POST /api/auth/token/refresh
```

**请求头**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Authorization | string | 是 | Bearer Token |

**响应示例**

```json
{
  "code": 200,
  "message": "刷新成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 2592000
  },
  "timestamp": 1705310700000
}
```

---

## 审核题目接口

### 获取审核题目列表

```
GET /api/review/questions
```

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 否 | 题目类型: single/multiple/fill |
| required | boolean | 否 | 是否必填 |

**响应示例**

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "questions": [
      {
        "id": "q1",
        "type": "single",
        "content": "服务器的 Forge 版本是多少？",
        "options": ["1.20.1", "1.20.4", "1.21.1", "1.21.3"],
        "required": true,
        "order": 1
      },
      {
        "id": "q2",
        "type": "multiple",
        "content": "以下哪些是服务器的核心玩法？",
        "options": ["领地保护", "经济系统", "宠物系统"],
        "required": true,
        "order": 2
      },
      {
        "id": "q3",
        "type": "fill",
        "content": "服务器的公开群号是多少？",
        "required": true,
        "order": 3
      }
    ],
    "total": 5,
    "requiredCount": 5
  },
  "timestamp": 1705310700000
}
```

### 获取题目详情

```
GET /api/review/questions/:id
```

**响应示例**

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": "q1",
    "type": "single",
    "content": "服务器的 Forge 版本是多少？",
    "options": ["1.20.1", "1.20.4", "1.21.1", "1.21.3"],
    "required": true,
    "order": 1,
    "hint": "Hint: 查看服务器特性页面"
  },
  "timestamp": 1705310700000
}
```

---

## 提交审核接口

### 提交审核答案

```
POST /api/review/submit
```

**请求头**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Authorization | string | 是 | Bearer Token |
| Content-Type | application/json |

**请求体**

```json
{
  "answers": {
    "q1": "1.20.1",
    "q2": ["领地保护", "经济系统"],
    "q3": "1234567890",
    "q4": "使用锁链箱子",
    "q5": "MyPlayer"
  }
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "提交成功",
  "data": {
    "submissionId": "sub_xyz789",
    "status": "pending",
    "aiReviewId": "air_abc123",
    "submittedAt": "2024-01-15T10:10:00Z",
    "estimatedTime": 30  // 预计等待秒数
  },
  "timestamp": 1705310700000
}
```

### 获取提交结果

```
GET /api/review/result/:submissionId
```

**响应示例**

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "submissionId": "sub_xyz789",
    "status": "completed",
    "result": {
      "passed": true,
      "reason": "答案符合服务器规范，继续保持！",
      "score": 95,
      "details": [
        {
          "questionId": "q1",
          "correct": true,
          "feedback": "正确"
        },
        {
          "questionId": "q2",
          "correct": true,
          "feedback": "正确"
        }
      ]
    },
    "code": "ABC123",
    "groupNumber": "1234567890",
    "completedAt": "2024-01-15T10:10:30Z"
  },
  "timestamp": 1705310700000
}
```

### 轮询审核状态

```
GET /api/review/status
```

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| submissionId | string | 否 | 提交ID，不传则获取最近一次 |

**响应示例**

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "submissionId": "sub_xyz789",
    "status": "completed",      // pending/processing/completed/failed
    "passed": true,
    "processedAt": "2024-01-15T10:10:30Z"
  },
  "timestamp": 1705310700000
}
```

---

## QQ机器人接口

### Webhook - 审核结果通知

当审核完成后，调用此接口通知QQ机器人发送消息给用户。

```
POST /api/bot/notify
```

**请求体**

```json
{
  "qq": "1234567890",
  "type": "review_result",
  "data": {
    "passed": true,
    "reason": "答案符合服务器规范，继续保持！",
    "code": "ABC123",
    "groupNumber": "1234567890"
  }
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "通知已发送",
  "data": {
    "messageId": "msg_abc123",
    "sentAt": "2024-01-15T10:10:35Z"
  },
  "timestamp": 1705310700000
}
```

### Webhook - 加群验证

QQ机器人收到加群请求时，验证验证码是否有效。

```
POST /api/bot/verifyJoin
```

**请求体**

```json
{
  "qq": "1234567890",
  "groupNumber": "1234567890",
  "verifyCode": "ABC123"
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "验证成功",
  "data": {
    "valid": true,
    "user": {
      "id": "usr_abc123",
      "mcUsername": "PlayerName",
      "reviewTime": "2024-01-15T10:10:00Z"
    }
  },
  "timestamp": 1705310700000
}
```

### QQ消息回调

```
POST /api/bot/webhook
```

QQ机器人接收消息的回调接口。

**请求体**

```json
{
  "messageType": "group",  // group/private
  "groupId": "1234567890",
  "sender": {
    "qq": "9876543210",
    "nickname": "User"
  },
  "message": "你好",
  "rawMessage": "[CQ:at,qq=123456] 你好",
  "timestamp": 1705310700000
}
```

---

## 数据模型

### 用户表 (users)

```sql
CREATE TABLE `users` (
  `id` VARCHAR(32) PRIMARY KEY COMMENT '用户ID',
  `qq` VARCHAR(11) UNIQUE NOT NULL COMMENT 'QQ号码',
  `mc_username` VARCHAR(16) COMMENT 'Minecraft游戏ID',
  `email` VARCHAR(255) COMMENT '邮箱',
  `password_hash` VARCHAR(255) COMMENT '密码哈希',
  `bind_time` DATETIME COMMENT '绑定时间',
  `last_login_time` DATETIME COMMENT '最后登录时间',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 0禁用 1正常',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_qq` (`qq`),
  INDEX `idx_mc_username` (`mc_username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

### 验证码表 (verification_codes)

```sql
CREATE TABLE `verification_codes` (
  `id` VARCHAR(32) PRIMARY KEY COMMENT '验证码ID',
  `qq` VARCHAR(11) NOT NULL COMMENT 'QQ号码',
  `code` VARCHAR(6) NOT NULL COMMENT '验证码',
  `type` VARCHAR(16) NOT NULL COMMENT '类型: bind/reset',
  `used` TINYINT DEFAULT 0 COMMENT '是否使用',
  `expires_at` DATETIME NOT NULL COMMENT '过期时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_qq_type` (`qq`, `type`),
  INDEX `idx_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='验证码表';
```

### 审核题目表 (review_questions)

```sql
CREATE TABLE `review_questions` (
  `id` VARCHAR(32) PRIMARY KEY COMMENT '题目ID',
  `type` VARCHAR(16) NOT NULL COMMENT '类型: single/multiple/fill',
  `content` TEXT NOT NULL COMMENT '题目内容',
  `options` JSON COMMENT '选项列表',
  `answer` JSON COMMENT '正确答案',
  `required` TINYINT DEFAULT 1 COMMENT '是否必填',
  `order` INT DEFAULT 0 COMMENT '排序',
  `hint` TEXT COMMENT '提示',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 0禁用 1启用',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_status` (`status`),
  INDEX `idx_order` (`order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='审核题目表';
```

### 审核提交表 (review_submissions)

```sql
CREATE TABLE `review_submissions` (
  `id` VARCHAR(32) PRIMARY KEY COMMENT '提交ID',
  `user_id` VARCHAR(32) NOT NULL COMMENT '用户ID',
  `answers` JSON NOT NULL COMMENT '答案',
  `status` VARCHAR(16) DEFAULT 'pending' COMMENT '状态: pending/processing/completed/failed',
  `ai_review_id` VARCHAR(32) COMMENT 'AI审核ID',
  `result` JSON COMMENT '审核结果',
  `code` VARCHAR(8) COMMENT '通过验证码',
  `group_number` VARCHAR(32) COMMENT '群号',
  `ip_address` VARCHAR(45) COMMENT 'IP地址',
  `submitted_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `processed_at` DATETIME COMMENT '处理完成时间',
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_submitted_at` (`submitted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='审核提交表';
```

### AI审核记录表 (ai_reviews)

```sql
CREATE TABLE `ai_reviews` (
  `id` VARCHAR(32) PRIMARY KEY COMMENT '审核ID',
  `submission_id` VARCHAR(32) NOT NULL COMMENT '提交ID',
  `answers` JSON NOT NULL COMMENT '提交的答案',
  `prompt` TEXT COMMENT '发送给AI的提示词',
  `response` TEXT COMMENT 'AI响应',
  `result` JSON COMMENT '解析后的结果',
  `model` VARCHAR(64) COMMENT '使用的AI模型',
  `tokens_used` INT COMMENT '消耗的Token数',
  `processing_time` INT COMMENT '处理耗时(毫秒)',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_submission_id` (`submission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI审核记录表';
```

### 验证码记录表 (verification_codes_log)

```sql
CREATE TABLE `verification_codes_log` (
  `id` VARCHAR(32) PRIMARY KEY COMMENT '日志ID',
  `qq` VARCHAR(11) NOT NULL COMMENT 'QQ号码',
  `type` VARCHAR(16) NOT NULL COMMENT '类型',
  `ip_address` VARCHAR(45) COMMENT 'IP地址',
  `user_agent` TEXT COMMENT '用户代理',
  `result` VARCHAR(16) COMMENT '结果: success/failed',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_qq_date` (`qq`, `created_at`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='验证码发送日志表';
```

### QQ消息记录表 (qq_messages)

```sql
CREATE TABLE `qq_messages` (
  `id` VARCHAR(32) PRIMARY KEY COMMENT '消息ID',
  `message_type` VARCHAR(16) NOT NULL COMMENT '消息类型: group/private',
  `group_number` VARCHAR(32) COMMENT '群号',
  `sender_qq` VARCHAR(11) NOT NULL COMMENT '发送者QQ',
  `content` TEXT NOT NULL COMMENT '消息内容',
  `direction` VARCHAR(8) NOT NULL COMMENT '方向: in/out',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_group_time` (`group_number`, `created_at`),
  INDEX `idx_sender_time` (`sender_qq`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='QQ消息记录表';
```

---

## AI 审核提示词示例

### 系统提示词

```
你是锐界幻境 Minecraft 服务器的新玩家审核AI。你的任务是：
1. 检查玩家是否认真阅读了服务器规则文档
2. 验证答案是否符合服务器实际情况
3. 判断玩家是否适合加入服务器

评分标准：
- 正确答案得20分/题
- 部分正确得10分/题
- 错误答案得0分

通过标准：总分 >= 60分

注意：
- 如果答案明显是乱填的（如填写"不知道"、"123"等），直接判定为不通过
- 如果发现玩家有不良倾向（如表示会熊服、偷东西等），直接判定为不通过
- 保持友善但严格的态度
```

### 用户答案示例

```
请审核以下玩家的审核答案：

玩家QQ：1234567890
游戏ID：PlayerName

题目1：服务器的 Forge 版本是多少？
答案：1.20.1

题目2：以下哪些是服务器的核心玩法？
答案：["领地保护", "经济系统"]

题目3：服务器的公开群号是多少？
答案：1234567890

请返回JSON格式的审核结果：
{
  "passed": true/false,
  "score": 85,
  "reason": "简要说明",
  "details": [
    {"questionId": "q1", "correct": true, "feedback": "具体反馈"}
  ]
}
```

---

## WebSocket 连接（可选）

用于实时推送审核进度。

```
WS /api/ws/review
```

**连接消息**

```json
{
  "type": "subscribe",
  "channel": "review_progress",
  "submissionId": "sub_xyz789"
}
```

**进度推送**

```json
{
  "type": "progress",
  "submissionId": "sub_xyz789",
  "status": "processing",
  "message": "AI正在审核中...",
  "progress": 50
}
```
