// src/blog/blog.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpStatus, HttpException,Request} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody, ApiParam, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard'; // 导入工厂函数
import { UserLevel } from '../auth/enums/user-level.enum';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

/**
 * 博客模块控制器
 * 处理所有博客相关HTTP请求
 */
@Controller('blog')
@ApiTags('博客模块')
@ApiBearerAuth('JWT-auth') // 所有接口需要JWT认证
@UseGuards(JwtAuthGuard) // 全局校验登录状态
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  /**
   * 获取博客列表（分页+筛选）
   */
  @Get()
  @ApiOperation({ 
    summary: '获取博客列表', 
    description: '登录用户可查询博客列表，支持分页、关键词搜索、状态筛选' 
  })
  @ApiQuery({ name: 'page', required: false, example: 1, description: '页码（默认1）' })
  @ApiQuery({ name: 'size', required: false, example: 10, description: '每页条数（默认10）' })
  @ApiQuery({ name: 'keyword', required: false, example: 'NestJS', description: '搜索关键词（标题）' })
  @ApiQuery({ name: 'status', required: false, example: 1, description: '状态：0-草稿 1-已发布 2-已下架' })
  @ApiResponse({ 
    status: 200, 
    description: '查询成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '查询博客列表成功' },
        data: {
          type: 'object',
          properties: {
            list: { type: 'array', items: { type: 'object' } },
            total: { type: 'number', example: 100 },
            page: { type: 'number', example: 1 },
            size: { type: 'number', example: 10 },
            totalPages: { type: 'number', example: 10 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: '参数错误' })
  async getBlogList(
    @Query('page') page: number = 1,
    @Query('size') size: number = 10,
    @Query('keyword') keyword: string = '',
    @Query('status') status?: number
  ) {
    try {
      const result = await this.blogService.getBlogList({
        page,
        size,
        keyword,
        status,
      });

      return {
        code: HttpStatus.OK,
        message: '查询博客列表成功',
        data: result,
      };
    } catch (error) {
      throw new HttpException({
        code: error.getStatus?.() || HttpStatus.BAD_REQUEST,
        message: error.message || '查询博客列表失败',
        data: null,
      }, error.getStatus?.() || HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 获取博客详情
   */
  @Get(':id')
  @ApiOperation({ summary: '获取博客详情', description: '登录用户查询单篇博客详情' })
  @ApiParam({ name: 'id', example: '123e4567-e89b-12d3-a456-426614174000', description: '博客ID（UUID）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '博客不存在' })
  async getBlogDetail(@Param('id') id: string) {
    try {
      const blog = await this.blogService.getBlogDetail(id);

      return {
        code: HttpStatus.OK,
        message: '查询博客详情成功',
        data: blog,
      };
    } catch (error) {
      throw new HttpException({
        code: error.getStatus?.() || HttpStatus.BAD_REQUEST,
        message: error.message || '查询博客详情失败',
        data: null,
      }, error.getStatus?.() || HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 创建博客（VIP及以上权限）
   */
  @Post()
  @ApiOperation({ 
    summary: '创建博客', 
    description: 'VIP及以上等级用户可创建博客' 
  })
  @ApiBody({ type: CreateBlogDto, description: '博客创建参数' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 400, description: '参数错误' })
  // 修复：使用工厂函数创建守卫，传入权限等级
  @UseGuards(PermissionGuard({ requiredLevel: UserLevel.VIP }))
  async createBlog(@Body() createBlogDto: CreateBlogDto, @Request() req) {
    try {
      // 从JWT获取当前用户ID（作者ID）
      const authorId = req.user.sub;
      const newBlog = await this.blogService.createBlog(createBlogDto, authorId);

      return {
        code: HttpStatus.CREATED,
        message: '创建博客成功',
        data: newBlog,
      };
    } catch (error) {
      throw new HttpException({
        code: error.getStatus?.() || HttpStatus.BAD_REQUEST,
        message: error.message || '创建博客失败',
        data: null,
      }, error.getStatus?.() || HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 更新博客（作者/管理员权限）
   */
  @Put(':id')
  @ApiOperation({ 
    summary: '更新博客', 
    description: '博客作者或管理员可更新博客' 
  })
  @ApiParam({ name: 'id', example: '123e4567-e89b-12d3-a456-426614174000', description: '博客ID' })
  @ApiBody({ type: UpdateBlogDto, description: '博客更新参数' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 403, description: '无更新权限' })
  @ApiResponse({ status: 404, description: '博客不存在' })
  async updateBlog(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
    @Request() req
  ) {
    try {
      const currentUserId = req.user.sub;
      const currentUserLevel = req.user.level || UserLevel.Normal;

      // 获取博客详情（自动校验是否存在）
      const blog = await this.blogService.getBlogDetail(id);

      // 权限校验：仅作者或管理员可更新
      if (blog.authorId !== currentUserId && currentUserLevel < UserLevel.Admin) {
        throw new HttpException({
          code: HttpStatus.FORBIDDEN,
          message: '无更新权限（仅作者或管理员可更新）',
          data: null
        }, HttpStatus.FORBIDDEN);
      }

      const updatedBlog = await this.blogService.updateBlog(id, updateBlogDto);

      return {
        code: HttpStatus.OK,
        message: '更新博客成功',
        data: updatedBlog,
      };
    } catch (error) {
      throw new HttpException({
        code: error.getStatus?.() || HttpStatus.BAD_REQUEST,
        message: error.message || '更新博客失败',
        data: null,
      }, error.getStatus?.() || HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 删除博客（管理员权限）
   */
  @Delete(':id')
  @ApiOperation({ 
    summary: '删除博客', 
    description: '管理员及以上等级用户可删除博客' 
  })
  @ApiParam({ name: 'id', example: '123e4567-e89b-12d3-a456-426614174000', description: '博客ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '博客不存在' })
  // 修复：使用工厂函数创建守卫，传入管理员等级
  @UseGuards(PermissionGuard({ requiredLevel: UserLevel.Admin }))
  async deleteBlog(@Param('id') id: string) {
    try {
      const result = await this.blogService.deleteBlog(id);

      return {
        code: HttpStatus.OK,
        message: '删除博客成功',
        data: result,
      };
    } catch (error) {
      throw new HttpException({
        code: error.getStatus?.() || HttpStatus.BAD_REQUEST,
        message: error.message || '删除博客失败',
        data: null,
      }, error.getStatus?.() || HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 博客上下架（管理员权限）
   */
  @Put(':id/status')
  @ApiOperation({ 
    summary: '博客上下架', 
    description: '管理员及以上等级用户可修改博客发布状态' 
  })
  @ApiParam({ name: 'id', example: '123e4567-e89b-12d3-a456-426614174000', description: '博客ID' })
  @ApiQuery({ name: 'status', example: 1, description: '目标状态：0-草稿 1-发布 2-下架' })
  @ApiResponse({ status: 200, description: '状态修改成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '博客不存在' })
  @ApiResponse({ status: 400, description: '状态参数错误' })
  // 修复：使用工厂函数创建守卫，传入管理员等级
  @UseGuards(PermissionGuard({ requiredLevel: UserLevel.Admin }))
  async updateBlogStatus(
    @Param('id') id: string,
    @Query('status') status: number
  ) {
    try {
      // 先校验博客是否存在（通过getBlogDetail）
      const blog = await this.blogService.getBlogDetail(id);

      // 状态无变化则直接返回
      if (blog.status === status) {
        return {
          code: HttpStatus.OK,
          message: `博客已处于${status === 0 ? '草稿' : status === 1 ? '发布' : '下架'}状态`,
          data: { id, status },
        };
      }

      const result = await this.blogService.updateBlogStatus(id, status);

      return {
        code: HttpStatus.OK,
        message: `博客${status === 1 ? '发布' : '下架'}成功`,
        data: result,
      };
    } catch (error) {
      throw new HttpException({
        code: error.getStatus?.() || HttpStatus.BAD_REQUEST,
        message: error.message || '修改博客状态失败',
        data: null,
      }, error.getStatus?.() || HttpStatus.BAD_REQUEST);
    }
  }
}