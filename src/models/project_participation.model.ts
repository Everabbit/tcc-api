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
import { User, UserI } from './user.model';
import { RolesEnum } from '../enums/roles.enum';

export interface ProjectParticipationI {
  id?: number;
  userId: number;
  user?: UserI;
  projectId: number;
  project?: ProjectI;
  role: RolesEnum;
  invitedAt: Date;
  acceptedAt?: Date | null;
}

@Table({
  tableName: 'project_participation',
  timestamps: true,
  underscored: true,
})
export class ProjectParticipation extends Model implements ProjectParticipationI {
  @AutoIncrement
  @PrimaryKey
  @Column({ type: DataType.INTEGER })
  id?: number;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  userId!: number;

  @BelongsTo(() => User)
  user?: User;

  @AllowNull(false)
  @ForeignKey(() => Project)
  @Column({ type: DataType.INTEGER })
  projectId!: number;

  @BelongsTo(() => Project)
  project?: Project;

  @AllowNull(false)
  @Column({ type: DataType.INTEGER })
  role!: RolesEnum;

  @AllowNull(false)
  @Column({ type: DataType.DATE })
  invitedAt!: Date;

  @AllowNull(true)
  @Column({ type: DataType.DATE })
  acceptedAt?: Date | null;
}
