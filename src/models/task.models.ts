import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { TaskStatusEnum } from '../enums/status.enum';
import { PriorityEnum } from '../enums/task_priority.enum';
import { User, UserI } from './user.model';
import { Version, VersionI } from './version.model';
import { Attachment, AttachmentI } from './attachment.model';
import { Comment, CommentI } from './comment.model';
import TaskTag, { TaskTagI } from './task_tag.model';

export interface TaskI {
  id?: number;
  versionId: number;
  version?: VersionI;
  assigneeId?: number;
  assignee?: UserI;
  parentTaskId?: number;
  parentTask?: TaskI;
  title: string;
  description?: string;
  priority: PriorityEnum;
  status: TaskStatusEnum;
  deadline?: Date;
  blockReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
  attachments?: AttachmentI[];
  comments?: CommentI[];
  tags?: TaskTagI[];
}

@Table({
  tableName: 'tasks',
  timestamps: true,
  underscored: true,
})
export class Task extends Model implements TaskI {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id?: number;

  @ForeignKey(() => Version)
  @AllowNull(false)
  @Column({ type: DataType.INTEGER, onDelete: 'CASCADE' })
  versionId!: number;

  @BelongsTo(() => Version, 'versionId')
  version?: VersionI;

  @ForeignKey(() => User)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  assigneeId?: number;

  @BelongsTo(() => User, 'assigneeId')
  assignee?: UserI;

  @ForeignKey(() => Task)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  parentTaskId?: number;

  @BelongsTo(() => Task, 'parentTaskId')
  parentTask?: TaskI;

  @AllowNull(false)
  @Column(DataType.TEXT)
  title!: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  description?: string;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  priority!: PriorityEnum;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  status!: TaskStatusEnum;

  @AllowNull(true)
  @Column(DataType.DATE)
  deadline?: Date;

  @AllowNull(true)
  @Column(DataType.TEXT)
  blockReason?: string;

  @HasMany(() => Attachment)
  attachments?: AttachmentI[];

  @HasMany(() => Comment)
  comments?: CommentI[];

  @HasMany(() => TaskTag)
  tags?: TaskTagI[];
}
