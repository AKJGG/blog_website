// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// 业务模块导入
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BlogModule } from './blog/blog.module';
import { FileModule } from './file/file.module';

@Module({
  imports: [
    // 1. TypeORM 数据库配置（适配 PostgreSQL/MySQL，按需修改）
    TypeOrmModule.forRoot({
      type: 'postgres', // 若用 MySQL 改为 'mysql'
      host: 'localhost', // 数据库地址
      port: 5432, // PostgreSQL 默认5432，MySQL 默认3306
      username: 'postgres', // 数据库用户名（MySQL 通常是 root）
      password: '020711', // 数据库密码
      database: 'blog_db', // 数据库名（需提前创建）
      entities: [__dirname + '/**/*.entity{.ts,.js}'], // 自动加载所有实体
      synchronize: true, // 开发环境自动同步表结构（生产环境务必设为 false）
      logging: true, // 打印 SQL 日志（可选，生产环境建议关闭）
      autoLoadEntities: true,
    }),
    // 2. 文件上传配置（Multer）
    MulterModule.register({
      dest: join(__dirname, '../uploads'), // 文件上传临时目录
    }),
    // 3. 业务模块
    AuthModule,
    UserModule,
    BlogModule,
    FileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}