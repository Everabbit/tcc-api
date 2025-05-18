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
import { GitHubLink, GitHubLinkI } from './github_link.model';
import { Task, TaskI } from './task.models';

export interface CommitI {
  id?: number;
  linkId: number;
  link?: GitHubLinkI;
  taskId: number;
  task?: TaskI;
  hash: string;
  message: string;
  commitedAt: Date;
  author: string;
}

@Table({
  tableName: 'commits',
  timestamps: true,
  underscored: true,
})
export class Commit extends Model<CommitI, CommitI> implements CommitI {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id?: number;

  @ForeignKey(() => GitHubLink)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  linkId!: number;

  @BelongsTo(() => GitHubLink)
  link?: GitHubLinkI;

  @ForeignKey(() => Task)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  taskId!: number;

  @BelongsTo(() => Task)
  task?: TaskI;

  @AllowNull(false)
  @Column(DataType.STRING)
  hash!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  message!: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  commitedAt!: Date;

  @AllowNull(false)
  @Column(DataType.STRING)
  author!: string;
}
