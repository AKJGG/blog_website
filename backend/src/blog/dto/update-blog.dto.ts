// src/blog/dto/update-blog.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateBlogDto } from './create-blog.dto';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBlogDto extends PartialType(CreateBlogDto) {
  @ApiProperty({ 
    example: 'NestJS博客开发实战（更新版）', 
    description: '博客标题（可选）',
    required: false 
  })
  @IsOptional()
  @IsString({ message: '标题必须为字符串' })
  title?: string;

  @ApiProperty({ 
    example: '更新后的博客内容...', 
    description: '博客内容（可选）',
    required: false 
  })
  @IsOptional()
  @IsString({ message: '内容必须为字符串' })
  content?: string;

  @ApiProperty({ 
    example: 'https://example.com/new-cover.jpg', 
    description: '封面图片URL（可选）',
    required: false 
  })
  @IsOptional()
  @IsString({ message: '封面URL必须为字符串' })
  coverUrl?: string;

  @ApiProperty({ 
    example: 1, 
    description: '状态：0-草稿 1-已发布 2-已下架（可选）',
    required: false 
  })
  @IsOptional()
  @IsInt({ message: '状态必须为数字' })
  @Min(0, { message: '状态最小值为0' })
  @Max(2, { message: '状态最大值为2' })
  status?: number;
}