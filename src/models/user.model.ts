import { AllowNull, AutoIncrement, Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

export interface UserI {
  id?: number;
  fullName: string;
  email: string;
  password: string;
  username?: string | null;
  lastAcess?: Date | null;
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
}
