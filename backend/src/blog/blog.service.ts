// src/blog/blog.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Blog } from './entities/blog.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) {}

  /**
   * 获取博客列表（分页+筛选）- 匹配Controller调用的getBlogList
   */
  async getBlogList(query: {
    page: number;
    size: number;
    keyword?: string;
    status?: number;
  }) {
    const { page, size, keyword, status } = query;
    // 参数校验
    if (page < 1 || size < 1) {
      throw new HttpException({
        code: HttpStatus.BAD_REQUEST,
        message: '页码和每页条数必须大于0',
        data: null
      }, HttpStatus.BAD_REQUEST);
    }

    const skip = (page - 1) * size;
    const where: Record<string, any> = {};

    // 关键词筛选（标题）
    if (keyword && keyword.trim()) {
      where.title = Like(`%${keyword.trim()}%`);
    }

    // 状态筛选
    if (status !== undefined && status !== null) {
      if (![0, 1, 2].includes(status)) {
        throw new HttpException({
          code: HttpStatus.BAD_REQUEST,
          message: '状态参数错误，仅支持：0-草稿 1-已发布 2-已下架',
          data: null
        }, HttpStatus.BAD_REQUEST);
      }
      where.status = status;
    }

    // 分页查询
    const [list, total] = await this.blogRepository.findAndCount({
      where,
      skip,
      take: size,
      order: { createTime: 'DESC' },
    });

    return {
      list,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  /**
   * 获取博客详情 - 匹配Controller调用的getBlogDetail
   */
  async getBlogDetail(id: string) {
    if (!id) {
      throw new HttpException({
        code: HttpStatus.BAD_REQUEST,
        message: '博客ID不能为空',
        data: null
      }, HttpStatus.BAD_REQUEST);
    }

    const blog = await this.blogRepository.findOne({
      where: { id },
    });

    if (!blog) {
      throw new HttpException({
        code: HttpStatus.NOT_FOUND,
        message: '博客不存在',
        data: null
      }, HttpStatus.NOT_FOUND);
    }

    return blog;
  }

  /**
   * 创建博客 - 匹配Controller调用的createBlog
   */
  async createBlog(createBlogDto: CreateBlogDto, authorId: string) {
    // 参数校验
    if (!authorId) {
      throw new HttpException({
        code: HttpStatus.BAD_REQUEST,
        message: '作者ID不能为空',
        data: null
      }, HttpStatus.BAD_REQUEST);
    }

    const blogEntity = this.blogRepository.create({
      ...createBlogDto,
      authorId,
      status: createBlogDto.status ?? 0, // 默认草稿
      createTime: new Date(),
      updateTime: new Date(),
    });

    return await this.blogRepository.save(blogEntity);
  }

  /**
   * 更新博客 - 匹配Controller调用的updateBlog
   */
  async updateBlog(id: string, updateBlogDto: UpdateBlogDto) {
    // 先校验博客是否存在
    await this.getBlogDetail(id);

    const updateData = {
      ...updateBlogDto,
      updateTime: new Date(),
    };

    await this.blogRepository.update(id, updateData);

    // 返回更新后的详情
    return await this.getBlogDetail(id);
  }

  /**
   * 删除博客 - 匹配Controller调用的deleteBlog
   */
  async deleteBlog(id: string) {
    // 先校验博客是否存在
    await this.getBlogDetail(id);

    await this.blogRepository.delete(id);

    return {
      id,
      message: '删除成功',
    };
  }

  /**
   * 更新博客状态 - 匹配Controller调用的updateBlogStatus
   */
  async updateBlogStatus(id: string, status: number) {
    // 先校验博客是否存在
    await this.getBlogDetail(id);

    // 状态校验
    if (![0, 1, 2].includes(status)) {
      throw new HttpException({
        code: HttpStatus.BAD_REQUEST,
        message: '状态参数错误，仅支持：0-草稿 1-已发布 2-已下架',
        data: null
      }, HttpStatus.BAD_REQUEST);
    }

    await this.blogRepository.update(id, {
      status,
      updateTime: new Date(),
    });

    return {
      id,
      status,
      message: `博客状态已更新为${status === 0 ? '草稿' : status === 1 ? '已发布' : '已下架'}`,
    };
  }

  // 兼容原有方法名（避免其他地方调用报错）
  async getDetail(id: string) {
    return this.getBlogDetail(id);
  }

  async updateStatus(id: string, status: number) {
    return this.updateBlogStatus(id, status);
  }
}