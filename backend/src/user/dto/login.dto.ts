import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ 
    example: 'admin', 
    description: '用户名（唯一）',
    required: true 
  })
  @IsString({ message: '用户名必须为字符串' })
  @IsNotEmpty({ message: '用户名不能为空' })
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
}