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

export interface AttachmentI {
  id?: number;
  taskId: number;
  task?: TaskI;
  fileName: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

@Table({
  tableName: 'attachments',
  timestamps: true,
  underscored: true,
})
export class Attachment extends Model<AttachmentI> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => Task)
  @AllowNull(false)
  @Column({ type: DataType.INTEGER, onDelete: 'CASCADE' })
  taskId!: number;

  @BelongsTo(() => Task)
  task?: Task;

  @AllowNull(false)
  @Column(DataType.STRING)
  fileName!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  url!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  type!: string;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  size!: number;

  @AllowNull(false)
  @Column(DataType.DATE)
  uploadedAt!: Date;
}
