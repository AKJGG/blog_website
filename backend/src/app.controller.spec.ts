import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('根路由', () => {
    it('应返回博客系统信息', () => {
      expect(appController.getSystemInfo()).toEqual({
        code: 200,
        data: expect.objectContaining({ name: '博客系统后端' }),
        message: '获取系统信息成功',
      });
    });
  });

  describe('健康检查', () => {
    it('应返回健康状态', () => {
      expect(appController.healthCheck()).toEqual({
        code: 200,
        data: expect.objectContaining({ status: 'healthy' }),
        message: '博客后端服务运行正常',
      });
    });
  });
});