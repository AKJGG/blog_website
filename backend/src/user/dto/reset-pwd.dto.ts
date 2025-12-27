import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPwdDto {
  @ApiProperty({ 
    example: '123456', 
    description: '旧密码',
    required: true 
  })
  @IsString({ message: '旧密码必须为字符串' })
  @IsNotEmpty({ message: '旧密码不能为空' })
  @MinLength(6, { message: '旧密码长度不能少于6位' })
  oldPassword: string;

  @ApiProperty({ 
    example: '654321', 
    description: '新密码（最小6位，不能和旧密码一致）',
    required: true 
  })
  @IsString({ message: '新密码必须为字符串' })
  @IsNotEmpty({ message: '新密码不能为空' })
  @MinLength(6, { message: '新密码长度不能少于6位' })
  newPassword: string;

  @ApiProperty({ 
    example: '654321', 
    description: '确认新密码（需和新密码一致）',
    required: true 
  })
  @IsString({ message: '确认新密码必须为字符串' })
  @IsNotEmpty({ message: '确认新密码不能为空' })
  @Matches(/^.{6,}$/, { message: '确认新密码长度不能少于6位' })
  confirmNewPassword: string;
}