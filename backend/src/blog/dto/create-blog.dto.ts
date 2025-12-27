// src/blog/dto/create-blog.dto.ts
import { IsString, IsOptional, IsInt, Min, Max, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBlogDto {
  @ApiProperty({ 
    example: 'NestJS博客开发实战', 
    description: '博客标题（必填）',
    required: true 
  })
  @IsString({ message: '标题必须为字符串' })
  @IsNotEmpty({ message: '标题不能为空' })
  title: string;

  @ApiProperty({ 
    example: '本文讲解NestJS开发博客的核心步骤...', 
    description: '博客内容（必填）',
    required: true 
  })
  @IsString({ message: '内容必须为字符串' })
  @IsNotEmpty({ message: '内容不能为空' })
  content: string;

  @ApiProperty({ 
    example: 'https://example.com/cover.jpg', 
    description: '封面图片URL（可选）',
    required: false 
  })
  @IsOptional()
  @IsString({ message: '封面URL必须为字符串' })
  coverUrl?: string;

  @ApiProperty({ 
    example: 0, 
    description: '状态：0-草稿 1-已发布 2-已下架（默认0）',
    required: false,
    default: 0 
  })
  @IsOptional()
  @IsInt({ message: '状态必须为数字' })
  @Min(0, { message: '状态最小值为0' })
  @Max(2, { message: '状态最大值为2' })
  status?: number;
}