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
import { Project, ProjectI } from './project.model';

export interface GitHubLinkI {
  id?: number;
  projectId: number;
  project?: ProjectI;
  repoUrl: string;
  accessToken: string;
  lastSync: Date;
}

@Table({
  tableName: 'github_links',
  timestamps: true,
  underscored: true,
})
export class GitHubLink extends Model<GitHubLinkI> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @AllowNull(false)
  @ForeignKey(() => Project)
  @Column(DataType.INTEGER)
  projectId!: number;

  @BelongsTo(() => Project)
  project?: Project;

  @AllowNull(false)
  @Column(DataType.STRING)
  repoUrl!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  accessToken!: string;

  @AllowNull(true)
  @Column(DataType.DATE)
  lastSync!: Date;
}
