import {
  AllowNull,
  AutoIncrement,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { ProjectStatus } from '../enums/project_status.enum';
import { User } from './user.model';
import { ProjectParticipation, ProjectParticipationI } from './project_participation.model';
import { Version, VersionI } from './version.model';
import { Tag, TagI } from './tag.model';

export interface ProjectI {
  id?: number;
  creatorId: number;
  name: string;
  description?: string;
  status: ProjectStatus;
  banner?: string;
  deadline?: Date | null;
  progress: number;
  participation?: ProjectParticipationI[];
  createdAt?: Date;
  updatedAt?: Date;
  versions?: VersionI[];
  tags?: TagI[];
}

@Table({
  tableName: 'projects',
  timestamps: true,
  underscored: true,
})
export class Project extends Model implements ProjectI {
  @AutoIncrement
  @PrimaryKey
  @Column({ type: DataType.INTEGER })
  id?: number;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, onDelete: 'CASCADE' })
  creatorId!: number;

  @AllowNull(false)
  @Column({ type: DataType.STRING })
  name!: string;

  @AllowNull(true)
  @Column({ type: DataType.TEXT })
  description?: string | undefined;

  @AllowNull(false)
  @Column({ type: DataType.INTEGER })
  status!: ProjectStatus;

  @AllowNull(true)
  @Column({ type: DataType.TEXT })
  banner?: string | undefined;

  @AllowNull(true)
  @Column({ type: DataType.DATE })
  deadline?: Date | null;

  @AllowNull(false)
  @Column({ type: DataType.INTEGER })
  progress!: number;

  @HasMany(() => ProjectParticipation)
  participation?: ProjectParticipationI[];

  @HasMany(() => Version)
  versions?: VersionI[];

  @HasMany(() => Tag)
  tags?: TagI[];
}
