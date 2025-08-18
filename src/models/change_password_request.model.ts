import { AllowNull, AutoIncrement, Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

export interface ChangePasswordRequestI {
  id?: number;
  userId: number;
  hash: string;
  sentDate: Date;
  verified: boolean;
}

@Table({
  tableName: 'change_password_request',
  timestamps: true,
  underscored: true,
})
export class ChangePasswordRequest extends Model implements ChangePasswordRequestI {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  id?: number;

  @AllowNull(false)
  @Column({ type: DataType.INTEGER })
  userId!: number;

  @AllowNull(false)
  @Column({ type: DataType.STRING })
  hash!: string;

  @AllowNull(false)
  @Column({ type: DataType.DATE })
  sentDate!: Date;

  @AllowNull(false)
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  verified!: boolean;
}
