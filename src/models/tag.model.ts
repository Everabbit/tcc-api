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
import { Project, ProjectI } from './project.model';

export interface TagI {
  id?: number;
  projectId: number;
  project?: ProjectI;
  name: string;
  color?: string;
}

@Table({
  tableName: 'tags',
  timestamps: true,
})
export class Tag extends Model implements TagI {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  id?: number;

  @AllowNull(false)
  @ForeignKey(() => Project)
  @Column({ type: DataType.INTEGER })
  projectId!: number;

  @BelongsTo(() => Project)
  project?: ProjectI;

  @AllowNull(false)
  @Column({ type: DataType.STRING })
  name!: string;

  @AllowNull(true)
  @Column({ type: DataType.STRING })
  color?: string;
}
