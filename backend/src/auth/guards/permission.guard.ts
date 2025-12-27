// src/auth/guards/permission.guard.ts
import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable,Inject } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { UserLevel } from '../enums/user-level.enum';

// 1. 定义守卫配置类型
export type PermissionGuardOptions = {
  requiredLevel: UserLevel;
};

// 2. 定义守卫核心接口（仅关注CanActivate，不限制构造函数）
export interface IPermissionGuard extends CanActivate {}

// 3. 守卫工厂函数（完全修复类型断言 + 兼容DI注入）
export const PermissionGuard = (options: PermissionGuardOptions): any => {
  @Injectable()
  class PermissionGuardHost implements IPermissionGuard {
    // 保留public修饰符（兼容导出匿名类）
    constructor(
      @Inject(AuthService)
      public readonly authService: AuthService,
    ) {}

    // 核心权限校验逻辑（无修改）
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
      const request = context.switchToHttp().getRequest();
      const userId = request.user?.sub;

      // 1. 校验用户是否登录
      if (!userId) {
        throw new HttpException({
          code: HttpStatus.UNAUTHORIZED,
          message: '未登录或Token失效，请重新登录',
          data: null
        }, HttpStatus.UNAUTHORIZED);
      }

      // 2. 检查权限等级
      return this.authService.checkPermission(userId, options.requiredLevel).then(hasPermission => {
        if (!hasPermission) {
          throw new HttpException({
            code: HttpStatus.FORBIDDEN,
            message: `权限不足，需${UserLevel[options.requiredLevel]}（等级${options.requiredLevel}）及以上`,
            requiredLevel: options.requiredLevel,
            requiredLevelName: UserLevel[options.requiredLevel],
            data: null
          }, HttpStatus.FORBIDDEN);
        }
        return true;
      });
    }
  }

  // 修复：先转unknown，再转目标类型（按TS提示解决构造函数参数不匹配）
  return PermissionGuardHost as unknown as new () => IPermissionGuard;
};

// 兼容导出类型（避免其他文件导入报错）
export type PermissionGuardType = ReturnType<typeof PermissionGuard>;