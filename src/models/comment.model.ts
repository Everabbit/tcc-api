import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasOne,
  PrimaryKey,
  Table,
  Model,
} from 'sequelize-typescript';
import { Task, TaskI } from './task.models';
import { User, UserI } from './user.model';
import { RolesEnum } from '../enums/roles.enum';

export interface CommentI {
  id?: number;
  taskId: number;
  task?: TaskI;
  authorId: number;
  author?: UserI;
  authorRole?: RolesEnum;
  content: string;
  edited: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Table({
  tableName: 'comments',
  timestamps: true,
  underscored: true,
})
export class Comment extends Model implements CommentI {
  @AutoIncrement
  @PrimaryKey
  @Column({ type: DataType.INTEGER })
  id?: number;

  @AllowNull(false)
  @ForeignKey(() => Task)
  @Column({ type: DataType.INTEGER, onDelete: 'CASCADE' })
  taskId!: number;

  @BelongsTo(() => Task)
  task?: TaskI;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, onDelete: 'CASCADE' })
  authorId!: number;

  @BelongsTo(() => User)
  author?: UserI;

  @AllowNull(true)
  @Column({ type: DataType.INTEGER })
  authorRole?: RolesEnum;

  @AllowNull(false)
  @Column({ type: DataType.TEXT })
  content!: string;

  @AllowNull(false)
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  edited!: boolean;
}
