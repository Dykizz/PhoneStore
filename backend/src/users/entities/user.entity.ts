import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';

export interface IUser {
  id: string;
  email: string;
  userName: string;
  role: UserRole;
  remember?: boolean;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  EMPLOYEE = 'employee',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  userName: string;

  @Column()
  @Exclude()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ default: false })
  isBlocked: boolean;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  defaultAddress: string;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ nullable: true })
  avatar: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @JoinColumn({ name: 'supplierId' })
  @ManyToOne(() => User)
  createdBy: User;

  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
