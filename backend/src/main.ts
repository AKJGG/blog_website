// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  // 创建日志实例
  const logger = new Logger('Bootstrap');
  
  // 创建 Nest 应用实例
  const app = await NestFactory.create(AppModule);

  // 1. CORS 跨域配置（NestJS 内置，无需手动导入 cors 包）
  app.enableCors({
    origin: '*', // 开发环境允许所有跨域，生产环境改为具体域名（如 ['http://localhost:8080']）
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // 2. 全局参数校验（基于 class-validator）
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 过滤 DTO 中未定义的字段
      forbidNonWhitelisted: true, // 非白名单字段直接报错
      transform: true, // 自动转换参数类型（如 string 转 number）
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 3. Swagger 接口文档配置
  const swaggerConfig = new DocumentBuilder()
    .setTitle('博客系统 API')
    .setDescription('博客后端接口文档（NestJS + TypeORM）')
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT-auth', // 与控制器 @ApiBearerAuth('JWT-auth') 对应
    )
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document); // 文档访问地址：http://localhost:端口/api-docs

  // 4. 端口配置（核心：修改这里的数值即可换端口）
  const PORT = process.env.PORT || 3000; // 优先读取环境变量，默认 3000
  await app.listen(PORT);

  // 启动成功日志
  logger.log(`✅ 服务启动成功！`);
  logger.log(`🔗 访问地址：http://localhost:${PORT}`);
  logger.log(`📚 接口文档：http://localhost:${PORT}/api-docs`);
}

// 启动应用并捕获错误
bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('❌ 服务启动失败：', error.message);
  process.exit(1); // 启动失败退出进程
});