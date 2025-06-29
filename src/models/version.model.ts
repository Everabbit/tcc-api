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
import { VersionStatusEnum } from '../enums/status.enum';
import { Project, ProjectI } from './project.model';

export interface VersionI {
  id?: number;
  projectId: number;
  project?: ProjectI;
  name: string;
  description?: string;
  status: VersionStatusEnum;
  startDate: Date;
  endDate?: Date;
  githubBranch?: string;
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
  @Column({ type: DataType.INTEGER })
  projectId!: number;

  @BelongsTo(() => Project)
  project!: Project;

  @AllowNull(false)
  @Column({ type: DataType.STRING })
  name!: string;

  @AllowNull(true)
  @Column({ type: DataType.STRING })
  description?: string;

  @AllowNull(false)
  @Column({ type: DataType.INTEGER })
  status!: VersionStatusEnum;

  @AllowNull(false)
  @Column({ type: DataType.DATE })
  startDate!: Date;

  @AllowNull(true)
  @Column({ type: DataType.DATE })
  endDate?: Date;

  @AllowNull(true)
  @Column({ type: DataType.STRING })
  githubBranch?: string;
}
