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
import { Tag, TagI } from './tag.model';
import { Task, TaskI } from './task.models';

export interface TaskTagI {
  id?: number;
  taskId: number;
  task?: TaskI;
  tagId: number;
  tag?: TagI;
}

@Table({
  tableName: 'task_tag',
  timestamps: true,
  underscored: true,
})
export default class TaskTag extends Model implements TaskTagI {
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
  @ForeignKey(() => Tag)
  @Column({ type: DataType.INTEGER, onDelete: 'CASCADE' })
  tagId!: number;

  @BelongsTo(() => Tag)
  tag?: TagI;
}
