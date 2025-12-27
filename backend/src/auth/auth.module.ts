// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from './entities/user.entity';
import { UserLevel } from './enums/user-level.enum';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: 'blog-secret-key-2025', // 生产环境建议用环境变量
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [
    AuthService,
    JwtAuthGuard,
    // 导出UserLevel供其他模块使用
    {
      provide: 'USER_LEVEL',
      useValue: UserLevel,
    },
  ],
  exports: [
    AuthService,
    JwtModule,
    JwtAuthGuard,
    'USER_LEVEL',
  ],
})
export class AuthModule {}