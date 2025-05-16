import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { TaskStatusEnum } from '../enums/status.enum';
import { PriorityEnum } from '../enums/task_priority.enum';
import { User, UserI } from './user.model';
import { Version, VersionI } from './version.model';

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
}

@Table({
  tableName: 'tasks',
  timestamps: true,
})
export class Task extends Model implements TaskI {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id?: number;

  @ForeignKey(() => Version)
  @AllowNull(false)
  @Column(DataType.INTEGER)
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
  @Column(DataType.STRING)
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

  @AllowNull(false)
  @Column(DataType.DATE)
  deadline?: Date;

  @AllowNull(true)
  @Column(DataType.TEXT)
  blockReason?: string;
}
