import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { AuthModule } from '../auth/auth.module'; // 依赖Auth模块的JWT守卫

@Module({
  imports: [
    // 可选：配置multer（和main.ts配置互补，优先使用main.ts的全局配置）
    MulterModule.register({
      dest: './uploads',
      limits: {
        fileSize: 500 * 1024 * 1024 // 500MB上限
      }
    }),
    AuthModule // 导入Auth模块，使JwtAuthGuard可注入
  ],
  controllers: [FileController],
  providers: [FileService],
  exports: [FileService] // 导出FileService，供Blog模块调用（比如博客封面上传）
})
export class FileModule {}