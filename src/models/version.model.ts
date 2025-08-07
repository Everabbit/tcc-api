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
import { VersionStatusEnum } from '../enums/status.enum';
import { Project, ProjectI } from './project.model';
import { Task, TaskI } from './task.models';

export interface VersionI {
  id?: number;
  projectId: number;
  project?: ProjectI;
  name: string;
  description?: string;
  status: VersionStatusEnum;
  startDate?: Date;
  endDate?: Date;
  githubBranch?: string;
  tasks?: TaskI[];
}

@Table({
  tableName: 'versions',
  timestamps: true,
  underscored: true,
})
export class Version extends Model implements VersionI {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  id?: number;

  @AllowNull(false)
  @ForeignKey(() => Project)
  @Column({ type: DataType.INTEGER, onDelete: 'CASCADE' })
  projectId!: number;

  @BelongsTo(() => Project)
  project!: Project;

  @AllowNull(false)
  @Column({ type: DataType.TEXT })
  name!: string;

  @AllowNull(true)
  @Column({ type: DataType.TEXT })
  description?: string;

  @AllowNull(false)
  @Column({ type: DataType.INTEGER })
  status!: VersionStatusEnum;

  @AllowNull(true)
  @Column({ type: DataType.DATE })
  startDate?: Date;

  @AllowNull(true)
  @Column({ type: DataType.DATE })
  endDate?: Date;

  @AllowNull(true)
  @Column({ type: DataType.STRING })
  githubBranch?: string;

  @HasMany(() => Task)
  tasks?: TaskI[];
}
