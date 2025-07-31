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

export interface CommentI {
  id?: number;
  taskId: number;
  task?: TaskI;
  authorId: number;
  author?: UserI;
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
  @Column({ type: DataType.INTEGER })
  taskId!: number;

  @BelongsTo(() => Task)
  task?: TaskI;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  authorId!: number;

  @BelongsTo(() => User)
  author?: UserI;

  @AllowNull(false)
  @Column({ type: DataType.TEXT })
  content!: string;

  @AllowNull(false)
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  edited!: boolean;
}
