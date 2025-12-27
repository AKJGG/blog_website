// src/blog/entities/blog.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('blogs') // 数据库表名
export class Blog {
  /** 博客ID（UUID） */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 博客标题 */
  @Column({ length: 255, comment: '博客标题' })
  title: string;

  /** 博客内容 */
  @Column({ type: 'text', comment: '博客内容' })
  content: string;

  /** 作者ID（关联用户表） */
  @Column({ comment: '作者ID（用户UUID）' })
  authorId: string;

  /** 封面图片URL */
  @Column({ nullable: true, comment: '封面图片URL' })
  coverUrl: string;

  /** 博客状态：0-草稿 1-已发布 2-已下架 */
  @Column({ 
    type: 'int', 
    default: 0, 
    comment: '状态：0-草稿 1-已发布 2-已下架' 
  })
  status: number;

  /** 创建时间 */
  @CreateDateColumn({ comment: '创建时间' })
  createTime: Date;

  /** 更新时间 */
  @UpdateDateColumn({ comment: '更新时间' })
  updateTime: Date;
}