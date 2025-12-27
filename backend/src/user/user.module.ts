import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // 用于数据库实体管理
import { JwtModule } from '@nestjs/jwt'; // 用于JWT Token生成/验证
import { UserController } from './user.controller'; // 用户控制器
import { UserService } from './user.service'; // 用户服务
import { User } from '../auth/entities/user.entity'; // 复用Auth模块的User实体（避免重复定义）
import { AuthModule } from '../auth/auth.module'; // 依赖Auth模块的JWT守卫/权限逻辑

@Module({
  // 导入当前模块所需的依赖
  imports: [
    // 1. 注册User实体，使UserService能注入Repository操作数据库
    TypeOrmModule.forFeature([User]),
    
    // 2. 导入JWT模块（配置与根模块一致，保证Token生成/验证规则统一）
    JwtModule.register({
      secret: 'blog-secret-key-2025', // 与app.module.ts中的JWT密钥一致
      signOptions: { expiresIn: '24h' } // Token有效期24小时
    }),
    
    // 3. 导入Auth模块，复用JwtAuthGuard等守卫（保证登录态校验逻辑统一）
    AuthModule
  ],
  
  // 注册当前模块的控制器（暴露接口）
  controllers: [UserController],
  
  // 注册当前模块的服务（封装业务逻辑）
  providers: [UserService],
  
  // 导出UserService，供其他模块（如Blog）调用（比如博客模块需要获取作者信息）
  exports: [UserService]
})
export class UserModule {}