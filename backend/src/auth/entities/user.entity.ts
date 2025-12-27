import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
// 关键：从独立枚举文件导入，不再依赖auth.service.ts
import { UserLevel } from '../enums/user-level.enum';

@Entity('users') // 数据库表名：users
export class User {
  /** 主键ID（UUID） */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 用户名（唯一） */
  @Column({ unique: true, comment: '用户名（字母/数字/下划线，4-20位）' })
  username: string;

  /** 密码（bcrypt加密后） */
  @Column({ comment: '密码（加密存储，不可逆）' })
  password: string;

  /** 用户等级（默认普通用户） */
  @Column({ 
    type: 'int', 
    default: UserLevel.Normal, // 枚举正常访问，无循环依赖
    comment: '用户等级：0-游客 1-普通 2-VIP 3-管理员 4-超级管理员' 
  })
  level: UserLevel;

  /** 账号是否启用（默认启用） */
  @Column({ default: true, comment: '账号状态：true-启用 false-禁用' })
  isActive: boolean;

  /** 创建时间（自动生成） */
  @CreateDateColumn({ comment: '账号创建时间' })
  createTime: Date;

  /** 更新时间（自动更新） */
  @UpdateDateColumn({ comment: '账号信息更新时间' })
  updateTime: Date;
}