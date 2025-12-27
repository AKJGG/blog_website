import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
// 关键：从独立枚举文件导入UserLevel
import { UserLevel } from './enums/user-level.enum';

@Injectable()
export class AuthService {
  constructor(
    // 注入User实体仓库（操作数据库）
    @InjectRepository(User)
    private userRepository: Repository<User>,
    // 注入JWT服务（生成/验证Token）
    private jwtService: JwtService
  ) {}

  /**
   * 检查用户权限等级
   * @param userId 用户ID（从JWT解析）
   * @param requiredLevel 所需最低权限等级
   * @returns 是否拥有权限
   */
  async checkPermission(userId: string, requiredLevel: UserLevel): Promise<boolean> {
    // 仅查询用户等级字段（减少数据库开销）
    const user = await this.userRepository.findOne({ 
      where: { id: userId },
      select: ['level']
    });

    // 用户不存在 → 无权限
    if (!user) return false;
    // 用户等级 ≥ 所需等级 → 有权限
    return user.level >= requiredLevel;
  }

  /**
   * 生成JWT Token
   * @param userId 用户ID
   * @returns Token字符串
   */
  generateToken(userId: string): string {
    // Payload仅存储用户ID（避免敏感信息），过期时间在根模块配置
    return this.jwtService.sign({ sub: userId });
  }
}