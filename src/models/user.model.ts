import { AllowNull, AutoIncrement, Column, DataType, HasOne, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { UserPreferences, UserPreferencesI } from './user_preferences.model';
import { createSearchableHash, decrypt, encrypt } from '../helpers/encryption.helper';

export interface UserI {
  id?: number;
  fullName: string;
  email: string;
  password: string;
  emailHash?: string | null;
  username?: string | null;
  lastAccess?: Date | null;
  image?: string | null;
  refreshToken?: string | null;
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
  @Column({
    type: DataType.STRING,
    get(this: User) {
      const rawValue = this.getDataValue('fullName');
      return decrypt(rawValue);
    },
    set(this: User, value: string) {
      this.setDataValue('fullName', encrypt(value));
    },
  })
  fullName!: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    unique: true,
    get(this: User) {
      const rawValue = this.getDataValue('email');
      return decrypt(rawValue);
    },
    set(this: User, value: string) {
      this.setDataValue('email', encrypt(value));
      this.setDataValue('emailHash', createSearchableHash(value));
    },
  })
  email!: string;

  @AllowNull(true)
  @Column({ type: DataType.STRING, unique: true, field: 'email_hash' })
  emailHash?: string | null;

  @AllowNull(false)
  @Column({ type: DataType.STRING })
  password!: string;

  @AllowNull(true)
  @Column({ type: DataType.STRING })
  username?: string | null;

  @AllowNull(true)
  @Column({ type: DataType.DATE })
  lastAccess?: Date | null;

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

  @AllowNull(true)
  @Column({ type: DataType.STRING(512) })
  refreshToken?: string | null;

  @HasOne(() => UserPreferences)
  userPreferences?: UserPreferencesI;
}
