import { AllowNull, AutoIncrement, Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { ProjectStatus } from '../enums/project_status.enum';

export interface ProjectI {
  id?: number;
  name: string;
  description?: string;
  banner?: string;
  status: ProjectStatus;
  limitTime?: Date | null;
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
  @Column({ type: DataType.STRING })
  name!: string;

  @AllowNull(true)
  @Column({ type: DataType.STRING })
  description?: string | undefined;

  @AllowNull(true)
  @Column({ type: DataType.STRING })
  banner?: string | undefined;

  @AllowNull(false)
  @Column({ type: DataType.INTEGER })
  status!: ProjectStatus;

  @AllowNull(false)
  @Column({ type: DataType.DATE })
  limitTime?: Date | null;
}
