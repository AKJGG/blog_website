import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
@ApiTags('系统全局接口')
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * 根路由：获取博客系统基础信息
   */
  @Get()
  @ApiOperation({ summary: '系统信息', description: '获取博客后端全局配置' })
  @ApiResponse({ 
    status: 200, 
    description: '查询成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: { 
          type: 'object',
          properties: {
            name: { type: 'string', example: '博客系统后端' },
            version: { type: 'string', example: '1.0.0' },
            framework: { type: 'string', example: 'NestJS' },
            database: { type: 'string', example: 'PostgreSQL' },
            uploadLimit: { type: 'string', example: '500MB' }
          }
        },
        message: { type: 'string', example: '获取系统信息成功' }
      }
    }
  })
  getSystemInfo() {
    return {
      code: HttpStatus.OK,
      data: this.appService.getSystemInfo(),
      message: '获取系统信息成功'
    };
  }

  /**
   * 健康检查：检测系统核心服务状态
   */
  @Get('health')
  @ApiOperation({ summary: '健康检查', description: '验证数据库/文件服务等核心组件状态' })
  @ApiResponse({ status: 200, description: '系统健康' })
  @ApiResponse({ status: 500, description: '系统异常' })
  healthCheck() {
    return {
      code: HttpStatus.OK,
      data: this.appService.checkSystemHealth(),
      message: '博客后端服务运行正常'
    };
  }
}