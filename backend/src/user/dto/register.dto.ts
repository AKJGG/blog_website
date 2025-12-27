import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ 
    example: 'user001', 
    description: '用户名（唯一，字母/数字组合）',
    required: true 
  })
  @IsString({ message: '用户名必须为字符串' })
  @IsNotEmpty({ message: '用户名不能为空' })
  @Matches(/^[a-zA-Z0-9_]{4,20}$/, { message: '用户名仅支持字母、数字、下划线，长度4-20位' })
  username: string;

  @ApiProperty({ 
    example: '123456', 
    description: '密码（最小6位）',
    required: true 
  })
  @IsString({ message: '密码必须为字符串' })
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码长度不能少于6位' })
  password: string;

  @ApiProperty({ 
    example: '123456', 
    description: '确认密码（需和密码一致）',
    required: true 
  })
  @IsString({ message: '确认密码必须为字符串' })
  @IsNotEmpty({ message: '确认密码不能为空' })
  @Matches(/^.{6,}$/, { message: '确认密码长度不能少于6位' })
  confirmPassword: string;
}