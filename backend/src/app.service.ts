import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AppService {
  // 上传目录（与file模块保持一致）
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  /**
   * 获取系统全局信息
   */
  getSystemInfo() {
    return {
      name: '博客系统后端',
      version: '1.0.0',
      framework: 'NestJS',
      nodeVersion: process.version,
      database: 'PostgreSQL',
      uploadLimit: '500MB',
      supportFileTypes: ['image/jpeg', 'image/png', 'application/pdf', 'application/zip'],
      startTime: new Date().toISOString(),
    };
  }

  /**
   * 系统健康检查（核心组件状态检测）
   */
  checkSystemHealth() {
    // 1. 检测上传目录是否存在
    const uploadDirExists = fs.existsSync(this.uploadDir);
    // 2. 检测Node内存使用
    const memoryUsage = process.memoryUsage();
    // 3. 简化版数据库检测（实际项目可扩展为真实连接检测）
    const databaseStatus = 'connected'; // 开发环境默认正常

    return {
      status: uploadDirExists && databaseStatus === 'connected' ? 'healthy' : 'unhealthy',
      database: databaseStatus,
      uploadDir: uploadDirExists ? 'exists' : 'not exists',
      memoryUsage: {
        rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)}MB`, // 常驻内存
        heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`, // 已使用堆内存
      },
      timestamp: Date.now(),
    };
  }
}