import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // 1. 获取请求对象
    const request = context.switchToHttp().getRequest();
    // 2. 从请求头提取Token（格式：Bearer xxx）
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HttpException({
        code: HttpStatus.UNAUTHORIZED,
        message: '未登录，请先获取Token'
      }, HttpStatus.UNAUTHORIZED);
    }

    // 3. 解析Token
    const token = authHeader.split(' ')[1];
    try {
      // 4. 验证Token并挂载用户信息到request
      const payload = this.jwtService.verify(token);
      request.user = payload; // payload包含用户ID（sub）等信息
      return true;
    } catch (error) {
      throw new HttpException({
        code: HttpStatus.UNAUTHORIZED,
        message: 'Token无效或已过期'
      }, HttpStatus.UNAUTHORIZED);
    }
  }
}