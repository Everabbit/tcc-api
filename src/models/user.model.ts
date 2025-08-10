import { AllowNull, AutoIncrement, Column, DataType, HasOne, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { UserPreferences, UserPreferencesI } from './user_preferences.model';

export interface UserI {
  id?: number;
  fullName: string;
  email: string;
  password: string;
  username?: string | null;
  lastAcess?: Date | null;
  image?: string | null;
  userPreferences?: UserPreferencesI;
}

@Table({
  tableName: 'users',
  timestamps: true,
  underscored: true,
})
export class User extends Model implements UserI {
  @AutoIncrement
  @PrimaryKey
  @Column({ type: DataType.INTEGER })
  id?: number;

  @AllowNull(false)
  @Column({ type: DataType.STRING })
  fullName!: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING })
  email!: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING })
  password!: string;

  @AllowNull(true)
  @Column({ type: DataType.STRING })
  username?: string | null;

  @AllowNull(true)
  @Column({ type: DataType.DATE })
  lastAcess?: Date | null;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    get(this: User) {
      const rawValue = this.getDataValue('image');

      if (!rawValue) {
        return null;
      }

      const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

      return `${baseUrl}/uploads/${rawValue}`;
    },
  })
  image?: string | null;

  @HasOne(() => UserPreferences)
  userPreferences?: UserPreferencesI;
}
