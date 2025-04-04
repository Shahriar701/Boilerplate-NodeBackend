import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100, unique: true })
  email!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 200, select: false })
  password!: string;

  @Column({ default: false })
  isActive!: boolean;
  
  @Column({ nullable: true })
  lastLogin!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 