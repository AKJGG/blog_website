# blog_website
# NestJS 博客系统后端项目描述

## 1. 项目整体功能和核心业务场景
该项目是一个基于 **NestJS** 和 **TypeORM** 的博客系统后端，主要功能包括用户注册、登录、博客管理（创建、更新、删除、查询）、文件上传和管理等。系统支持 JWT 认证，确保用户操作的安全性和权限控制。项目适配前端 Vue 应用，提供 RESTful API 接口。

## 2. 项目的目录结构和核心模块
```
src/
├── app.controller.ts          # 全局控制器
├── app.module.ts              # 根模块
├── app.service.ts             # 全局服务
├── auth/                      # 认证模块
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   └── entities/
│       └── user.entity.ts
├── blog/                      # 博客模块
│   ├── blog.controller.ts
│   ├── blog.module.ts
│   ├── blog.service.ts
│   └── entities/
│       └── blog.entity.ts
├── file/                      # 文件上传模块
│   ├── file.controller.ts
│   ├── file.module.ts
│   └── file.service.ts
├── user/                      # 用户模块
│   ├── user.controller.ts
│   ├── user.module.ts
│   └── user.service.ts
└── main.ts                   # 应用入口
```

### 核心模块
- **控制器**: 处理 HTTP 请求，定义 API 接口。
- **服务**: 封装业务逻辑，提供数据处理功能。
- **中间件**: JWT 认证和权限校验。
- **数据库连接**: 使用 TypeORM 连接 PostgreSQL 数据库。

## 3. 核心接口的功能和调用方式
### 3.1 系统信息接口
- **GET /**: 获取系统基础信息。
- **返回**: 系统名称、版本、数据库类型等。

### 3.2 健康检查接口
- **GET /health**: 检查系统健康状态。
- **返回**: 状态、数据库连接状态、内存使用情况。

### 3.3 用户模块接口
- **POST /user/register**: 用户注册。
- **POST /user/login**: 用户登录，返回 JWT Token。
- **GET /user/info**: 获取当前用户信息（需登录）。

### 3.4 博客模块接口
- **GET /blog**: 获取博客列表，支持分页和筛选。
- **POST /blog**: 创建博客（需 登录及以上 权限）。
- **PUT /blog/:id**: 更新博客（需作者或管理员权限）。
- **DELETE /blog/:id**: 删除博客（需作者或管理员权限）。

### 3.5 文件模块接口
- **POST /file/upload**: 上传文件。
- **DELETE /file/delete**: 删除文件。
- **GET /file/list**: 获取已上传文件列表。

## 4. 数据模型/实体定义、关键配置项说明
### 4.1 数据模型
- **User**: 用户实体，包含用户名、密码、权限等级等字段。
- **Blog**: 博客实体，包含标题、内容、作者ID、状态等字段。

### 4.2 关键配置项
- **TypeORM**: 数据库连接配置，使用 PostgreSQL。
- **JWT**: 认证配置，密钥和过期时间设置。

## 5. 项目的技术亮点和核心业务逻辑
- **模块化设计**: 采用 NestJS 的模块化架构，便于维护和扩展。
- **JWT 认证**: 通过 JWT 实现用户认证和权限控制，确保 API 安全。
- **Swagger 文档**: 自动生成 API 文档，便于前后端协作。
- **文件上传管理**: 使用 Multer 处理文件上传，支持多种文件类型和大小限制。
- **异常处理**: 统一的异常处理机制，确保 API 返回一致的错误格式。

该项目展示了 NestJS 在构建现代 Web 应用中的强大能力，适合用于学习和实际开发。
