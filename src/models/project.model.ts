import { AllowNull, AutoIncrement, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { ProjectStatus } from '../enums/project_status.enum';
import { User } from './user.model';

export interface ProjectI {
  id?: number;
  creatorId: number;
  name: string;
  description?: string;
  status: ProjectStatus;
  banner?: string;
  deadline?: Date | null;
  progress: number;
}

@Table({
  tableName: 'projects',
  timestamps: true,
})
export class Project extends Model implements ProjectI {
  @AutoIncrement
  @PrimaryKey
  @Column({ type: DataType.INTEGER })
  id?: number;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  creatorId!: number;

  @AllowNull(false)
  @Column({ type: DataType.STRING })
  name!: string;

  @AllowNull(true)
  @Column({ type: DataType.STRING })
  description?: string | undefined;

  @AllowNull(false)
  @Column({ type: DataType.INTEGER })
  status!: ProjectStatus;

  @AllowNull(true)
  @Column({ type: DataType.STRING })
  banner?: string | undefined;

  @AllowNull(false)
  @Column({ type: DataType.DATE })
  deadline?: Date | null;

  @AllowNull(false)
  @Column({ type: DataType.INTEGER })
  progress!: number;
}
