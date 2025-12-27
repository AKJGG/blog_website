import { Controller, Post, Delete, Get, Query, UseInterceptors, UploadedFile, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileService } from './file.service';

@Controller('file')
@ApiTags('文件上传模块')
@ApiBearerAuth('JWT-auth') // 需要登录才能上传/删除文件
@UseGuards(JwtAuthGuard) // 全局登录认证
export class FileController {
  constructor(private readonly fileService: FileService) {}

  /**
   * 单文件上传（博客封面/附件）
   */
  @Post('upload')
  @ApiOperation({ summary: '文件上传', description: '上传博客封面/附件（支持图片/PDF/压缩包）' })
  @ApiConsumes('multipart/form-data') // 支持表单上传
  @ApiResponse({ status: 201, description: '上传成功' })
  @ApiResponse({ status: 400, description: '文件类型/大小不符合要求' })
  @UseInterceptors(FileInterceptor('file')) // 接收前端名为file的文件
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const result = await this.fileService.uploadFile(file);
    return {
      code: HttpStatus.CREATED,
      message: '文件上传成功',
      data: result
    };
  }

  /**
   * 删除文件
   */
  @Delete('delete')
  @ApiOperation({ summary: '删除文件', description: '根据文件名删除上传的文件' })
  @ApiQuery({ name: 'fileName', example: '123e4567-e89b-12d3-a456-426614174000.png', description: '上传生成的唯一文件名' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '文件不存在' })
  async deleteFile(@Query('fileName') fileName: string) {
    return this.fileService.deleteFile(fileName);
  }

  /**
   * 获取文件列表（分页）
   */
  @Get('list')
  @ApiOperation({ summary: '获取文件列表', description: '分页查询已上传的文件' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: '页码，默认1' })
  @ApiQuery({ name: 'size', required: false, example: 10, description: '每页条数，默认10' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getFileList(
    @Query('page') page: number = 1,
    @Query('size') size: number = 10
  ) {
    return this.fileService.getFileList(page, size);
  }
}