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
import { Task, TaskI } from './task.models';
import { User } from './user.model';
import { UserI } from './user.model';

export interface TaskHistoryI {
  id?: number;
  taskId: number;
  task?: TaskI;
  field: string;
  oldValue?: string;
  newValue?: string;
  changedAt: Date;
  changedBy: number;
  user?: UserI;
}

@Table({
  tableName: 'task_history',
  timestamps: true,
  underscored: true,
})
export class TaskHistory extends Model implements TaskHistoryI {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id?: number;

  @AllowNull(false)
  @ForeignKey(() => Task)
  @Column({ type: DataType.INTEGER, onDelete: 'CASCADE' })
  taskId!: number;

  @BelongsTo(() => Task)
  task?: TaskI;

  @AllowNull(false)
  @Column(DataType.STRING)
  field!: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  oldValue?: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  newValue?: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  changedAt!: Date;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, onDelete: 'SET NULL' })
  changedBy!: number;

  @BelongsTo(() => User)
  user?: UserI;
}
