import { AllowNull, AutoIncrement, Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

export interface UserI {
  id?: number;
  email: string;
  password: string;
  name: string;
  username?: string | null;
  birth?: Date | null;
  lastAcess?: Date | null;
  image?: string | null;
}

@Table({
  tableName: 'users',
  timestamps: true,
})
export class User extends Model implements UserI {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  id!: number;

  @AllowNull(false)
  @Column({ type: DataType.TEXT })
  email!: string;

  @AllowNull(false)
  @Column({ type: DataType.TEXT })
  password!: string;

  @AllowNull(false)
  @Column({ type: DataType.TEXT })
  name!: string;

  @AllowNull(true)
  @Column({ type: DataType.TEXT })
  username!: string | null;

  @AllowNull(true)
  @Column({ type: DataType.DATE })
  birth!: Date | null;

  @AllowNull(true)
  @Column({ type: DataType.DATE })
  lastAcess?: Date | null;

  @AllowNull(true)
  @Column({ type: DataType.TEXT })
  image?: string | null;
}
