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
import { User, UserI } from './user.model';

export interface UserPreferencesI {
  id?: number;
  userId: number;
  user: UserI;
  theme?: string;
  notifyEnabled?: boolean;
  notifyEmail?: boolean;
  notifyPush?: boolean;
}

@Table({
  tableName: 'user_preferences',
  timestamps: true,
  underscored: true,
})
export class UserPreferences extends Model implements UserPreferencesI {
  @AutoIncrement
  @PrimaryKey
  @Column({ type: DataType.INTEGER })
  id?: number;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  userId!: number;

  @BelongsTo(() => User)
  user!: UserI;

  @AllowNull(true)
  @Column({ type: DataType.STRING })
  theme?: string;

  @AllowNull(true)
  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  notifyEnabled?: boolean;

  @AllowNull(true)
  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  notifyEmail?: boolean;

  @AllowNull(true)
  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  notifyPush?: boolean;
}
