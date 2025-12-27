import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { Express } from 'express';

@Injectable()
export class FileService {
  // 上传目录（和 main.ts 保持一致）
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    // 初始化：确保上传目录存在
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * 文件上传（生成唯一文件名，避免重复）
   * @param file 前端上传的文件
   * @param allowedTypes 允许的文件类型（默认支持博客封面/附件）
   */
  async uploadFile(
    file: Express.Multer.File,
    allowedTypes: string[] = ['image/jpeg', 'image/png', 'application/pdf', 'application/zip']
  ) {
    // 1. 校验文件类型
    if (!allowedTypes.includes(file.mimetype)) {
      throw new HttpException({
        code: HttpStatus.BAD_REQUEST,
        message: `文件类型不允许，仅支持：${allowedTypes.join('、')}`
      }, HttpStatus.BAD_REQUEST);
    }

    // 2. 校验文件大小（500MB 上限，和 main.ts 保持一致）
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new HttpException({
        code: HttpStatus.BAD_REQUEST,
        message: `文件大小超过上限（500MB），当前大小：${(file.size / 1024 / 1024).toFixed(2)}MB`
      }, HttpStatus.BAD_REQUEST);
    }

    // 3. 生成唯一文件名（避免覆盖）
    const ext = path.extname(file.originalname); // 获取文件后缀（.png/.pdf）
    const fileName = `${randomUUID()}${ext}`; // 示例：123e4567-e89b-12d3-a456-426614174000.png
    const filePath = path.join(this.uploadDir, fileName);

    // 4. 写入文件到物理目录
    try {
      fs.writeFileSync(filePath, file.buffer);
    } catch (error) {
      throw new HttpException({
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `文件上传失败：${error.message}`
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // 5. 返回文件信息（供博客模块使用）
    return {
      url: `/uploads/${fileName}`, // 前端访问路径
      name: fileName, // 存储的文件名
      originalName: file.originalname, // 原始文件名
      size: file.size, // 文件大小（字节）
      mimetype: file.mimetype, // 文件类型
      uploadTime: new Date().toISOString() // 上传时间
    };
  }

  /**
   * 删除文件（根据存储的文件名）
   * @param fileName 上传时生成的唯一文件名
   */
  async deleteFile(fileName: string) {
    const filePath = path.join(this.uploadDir, fileName);
    // 校验文件是否存在
    if (!fs.existsSync(filePath)) {
      throw new HttpException({
        code: HttpStatus.NOT_FOUND,
        message: '文件不存在，删除失败'
      }, HttpStatus.NOT_FOUND);
    }

    // 删除文件
    try {
      fs.unlinkSync(filePath);
      return {
        code: HttpStatus.OK,
        message: '文件删除成功',
        data: { fileName }
      };
    } catch (error) {
      throw new HttpException({
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `文件删除失败：${error.message}`
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 获取上传文件列表（分页）
   * @param page 页码
   * @param size 每页条数
   */
  async getFileList(page: number = 1, size: number = 10) {
    try {
      // 读取上传目录下的所有文件
      const files = fs.readdirSync(this.uploadDir).filter(file => 
        !fs.statSync(path.join(this.uploadDir, file)).isDirectory()
      );

      // 分页处理
      const total = files.length;
      const start = (page - 1) * size;
      const end = start + size;
      const list = files.slice(start, end).map(fileName => {
        const filePath = path.join(this.uploadDir, fileName);
        const stat = fs.statSync(filePath);
        return {
          name: fileName,
          url: `/uploads/${fileName}`,
          size: stat.size,
          mimetype: this.getMimeType(fileName),
          createTime: stat.birthtime.toISOString()
        };
      });

      return {
        code: HttpStatus.OK,
        message: '查询文件列表成功',
        data: { list, total, page, size }
      };
    } catch (error) {
      throw new HttpException({
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `查询文件列表失败：${error.message}`
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 辅助方法：根据文件名获取MIME类型
   */
  private getMimeType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    const mimeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.pdf': 'application/pdf',
      '.zip': 'application/zip',
      '.rar': 'application/x-rar-compressed'
    };
    return mimeMap[ext] || 'application/octet-stream';
  }
}