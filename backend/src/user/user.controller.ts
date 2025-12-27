import { Controller, Post, Put, Get, Body, UseGuards, Request, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPwdDto } from './dto/reset-pwd.dto';

@Controller('user')
@ApiTags('用户账号模块')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 用户注册
   */
  @Post('register')
  @ApiOperation({ summary: '用户注册', description: '创建新用户（默认普通用户）' })
  @ApiResponse({ status: 201, description: '注册成功' })
  @ApiResponse({ status: 400, description: '参数错误/密码不一致' })
  @ApiResponse({ status: 409, description: '用户名已存在' })
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.userService.register(registerDto);
    return {
      code: HttpStatus.CREATED,
      message: '注册成功',
      data: result
    };
  }

  /**
   * 用户登录
   */
  @Post('login')
  @ApiOperation({ summary: '用户登录', description: '登录并获取JWT Token' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 404, description: '用户名或密码错误' })
  @ApiResponse({ status: 403, description: '账号已禁用' })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.userService.login(loginDto);
    return {
      code: HttpStatus.OK,
      message: '登录成功',
      data: result
    };
  }

  /**
   * 重置密码（需要登录）
   */
  @Put('reset-pwd')
  @ApiOperation({ summary: '重置密码', description: '登录后重置密码' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: '密码重置成功' })
  @ApiResponse({ status: 400, description: '旧密码错误/新密码不一致' })
  async resetPassword(@Request() req, @Body() resetPwdDto: ResetPwdDto) {
    // 从JWT解析的用户ID（req.user.sub 对应 auth/guards/jwt-auth.guard.ts 中的 payload.sub）
    const userId = req.user.sub;
    const result = await this.userService.resetPassword(userId, resetPwdDto);
    return {
      code: HttpStatus.OK,
      message: result.message,
      data: null
    };
  }

  /**
   * 获取用户信息（需要登录）
   */
  @Get('info')
  @ApiOperation({ summary: '获取用户信息', description: '登录后获取当前用户信息' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async getUserInfo(@Request() req) {
    const userId = req.user.sub;
    const result = await this.userService.getUserInfo(userId);
    return {
      code: HttpStatus.OK,
      message: '查询用户信息成功',
      data: result
    };
  }
}