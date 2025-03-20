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
import { Project, ProjectI } from './projects.model';
import { User, UserI } from './user.model';

export interface UserProjectI {
  id?: number;
  owner: boolean;
  userId: number;
  user?: UserI;
  projectId: number;
  project?: ProjectI;
}

@Table({
  tableName: 'users_projects',
  timestamps: true,
})
export class UserProject extends Model implements UserProjectI {
  @AutoIncrement
  @PrimaryKey
  @Column({ type: DataType.INTEGER })
  id?: number;

  @AllowNull(false)
  @Column({ type: DataType.INTEGER })
  owner!: boolean;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  userId!: number;

  @BelongsTo(() => User)
  user?: UserI | undefined;

  @AllowNull(false)
  @ForeignKey(() => Project)
  @Column({ type: DataType.INTEGER })
  projectId!: number;

  @BelongsTo(() => Project)
  project?: ProjectI | undefined;
}
