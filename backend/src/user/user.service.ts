import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
// 导入User实体（数据库模型）
import { User } from '../auth/entities/user.entity';
// 导入独立的用户等级枚举（解决循环依赖）
import { UserLevel } from '../auth/enums/user-level.enum';
// 导入用户DTO（参数校验）
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPwdDto } from './dto/reset-pwd.dto';

@Injectable()
export class UserService {
  // 密码加密盐值（越高越安全，默认10）
  private readonly saltRounds = 10;

  constructor(
    // 注入User实体仓库（操作数据库）
    @InjectRepository(User)
    private userRepository: Repository<User>,
    // 注入JWT服务（生成/验证Token，替代模拟Token）
    @Inject(JwtService)
    private jwtService: JwtService,
  ) {}

  /**
   * 用户注册
   * @param registerDto 注册参数（已通过DTO校验）
   * @returns 脱敏后的用户信息
   */
  async register(registerDto: RegisterDto) {
    const { username, password, confirmPassword } = registerDto;

    // 1. 校验密码与确认密码是否一致
    if (password !== confirmPassword) {
      throw new HttpException({
        code: HttpStatus.BAD_REQUEST,
        message: '密码与确认密码不一致，请重新输入',
        data: null
      }, HttpStatus.BAD_REQUEST);
    }

    // 2. 校验用户名是否已存在（唯一约束）
    const existUser = await this.userRepository.findOne({
      where: { username }
    });
    if (existUser) {
      throw new HttpException({
        code: HttpStatus.CONFLICT,
        message: '用户名已被占用，请更换用户名',
        data: null
      }, HttpStatus.CONFLICT);
    }

    // 3. 密码加密（bcrypt不可逆加密）
    const hashedPassword = await bcrypt.hash(password, this.saltRounds);

    // 4. 创建用户实体（默认普通用户等级、启用状态）
    const userEntity = this.userRepository.create({
      username,
      password: hashedPassword,
      level: UserLevel.Normal,
      isActive: true
    });

    // 5. 保存到数据库
    const savedUser = await this.userRepository.save(userEntity);

    // 6. 返回脱敏数据（隐藏密码）
    const { password: _, ...userInfo } = savedUser;
    return {
      code: HttpStatus.CREATED,
      message: '注册成功',
      data: userInfo
    };
  }

  /**
   * 用户登录
   * @param loginDto 登录参数（已通过DTO校验）
   * @returns 用户信息 + JWT Token
   */
  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // 1. 查询用户（包含密码，用于校验）
    const user = await this.userRepository.findOne({
      where: { username }
    });

    // 2. 校验用户是否存在
    if (!user) {
      throw new HttpException({
        code: HttpStatus.NOT_FOUND,
        message: '用户名或密码错误', // 统一提示，避免信息泄露
        data: null
      }, HttpStatus.NOT_FOUND);
    }

    // 3. 校验账号是否启用
    if (!user.isActive) {
      throw new HttpException({
        code: HttpStatus.FORBIDDEN,
        message: '账号已被禁用，请联系管理员',
        data: null
      }, HttpStatus.FORBIDDEN);
    }

    // 4. 校验密码是否正确（bcrypt对比明文与密文）
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new HttpException({
        code: HttpStatus.NOT_FOUND,
        message: '用户名或密码错误',
        data: null
      }, HttpStatus.NOT_FOUND);
    }

    // 5. 生成JWT Token（Payload仅存用户ID，过期时间在根模块配置）
    const token = this.jwtService.sign({ sub: user.id });

    // 6. 返回脱敏用户信息 + Token
    const { password: _, ...userInfo } = user;
    return {
      code: HttpStatus.OK,
      message: '登录成功',
      data: {
        userInfo,
        token,
        expiresIn: '24h' // 与JWT配置一致
      }
    };
  }

  /**
   * 重置密码（需登录）
   * @param userId 用户ID（从JWT解析）
   * @param resetPwdDto 重置密码参数（已通过DTO校验）
   * @returns 操作结果
   */
  async resetPassword(userId: string, resetPwdDto: ResetPwdDto) {
    const { oldPassword, newPassword, confirmNewPassword } = resetPwdDto;

    // 1. 校验新密码与确认新密码是否一致
    if (newPassword !== confirmNewPassword) {
      throw new HttpException({
        code: HttpStatus.BAD_REQUEST,
        message: '新密码与确认新密码不一致',
        data: null
      }, HttpStatus.BAD_REQUEST);
    }

    // 2. 校验新密码是否与旧密码相同
    if (newPassword === oldPassword) {
      throw new HttpException({
        code: HttpStatus.BAD_REQUEST,
        message: '新密码不能与旧密码相同',
        data: null
      }, HttpStatus.BAD_REQUEST);
    }

    // 3. 查询用户（获取旧密码）
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });
    if (!user) {
      throw new HttpException({
        code: HttpStatus.NOT_FOUND,
        message: '用户不存在',
        data: null
      }, HttpStatus.NOT_FOUND);
    }

    // 4. 校验旧密码是否正确
    const isOldPwdValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPwdValid) {
      throw new HttpException({
        code: HttpStatus.BAD_REQUEST,
        message: '旧密码错误，请重新输入',
        data: null
      }, HttpStatus.BAD_REQUEST);
    }

    // 5. 加密新密码并更新
    const hashedNewPassword = await bcrypt.hash(newPassword, this.saltRounds);
    await this.userRepository.update(userId, {
      password: hashedNewPassword
    });

    return {
      code: HttpStatus.OK,
      message: '密码重置成功，请重新登录',
      data: null
    };
  }

  /**
   * 获取当前用户信息（需登录）
   * @param userId 用户ID（从JWT解析）
   * @returns 脱敏后的用户信息（含等级名称）
   */
  async getUserInfo(userId: string) {
    // 查询用户（仅返回脱敏字段，隐藏密码）
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'username', 'level', 'isActive', 'createTime', 'updateTime']
    });

    if (!user) {
      throw new HttpException({
        code: HttpStatus.NOT_FOUND,
        message: '用户不存在',
        data: null
      }, HttpStatus.NOT_FOUND);
    }

    // 映射用户等级为中文名称（前端友好）
    const levelNameMap: Record<UserLevel, string> = {
      [UserLevel.Guest]: '游客',
      [UserLevel.Normal]: '普通用户',
      [UserLevel.VIP]: 'VIP用户',
      [UserLevel.Admin]: '管理员',
      [UserLevel.SuperAdmin]: '超级管理员'
    };

    return {
      code: HttpStatus.OK,
      message: '获取用户信息成功',
      data: {
        ...user,
        levelName: levelNameMap[user.level]
      }
    };
  }

  /**
   * 辅助方法：根据用户名查询用户（供其他模块调用）
   * @param username 用户名
   * @returns 用户实体（含密码，仅内部使用）
   */
  async findUserByUsername(username: string) {
    return this.userRepository.findOne({ where: { username } });
  }
}