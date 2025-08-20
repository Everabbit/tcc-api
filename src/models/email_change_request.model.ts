import { AllowNull, AutoIncrement, Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { createSearchableHash, decrypt, encrypt } from '../helpers/encryption.helper';

export interface EmailChangeRequestI {
  id?: number;
  userId: number;
  newEmail: string;
  newEmailHash?: string | null;
  hash: string;
  sentDate: Date;
  verified: boolean;
}

@Table({
  tableName: 'email_change_request',
  timestamps: true,
  underscored: true,
})
export class EmailChangeRequest extends Model implements EmailChangeRequestI {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  id?: number;

  @AllowNull(false)
  @Column({ type: DataType.INTEGER })
  userId!: number;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    get(this: EmailChangeRequest) {
      const rawValue = this.getDataValue('newEmail');
      return decrypt(rawValue);
    },
    set(this: EmailChangeRequest, value: string) {
      this.setDataValue('newEmail', encrypt(value));
      this.setDataValue('newEmailHash', createSearchableHash(value));
    },
  })
  newEmail!: string;

  @AllowNull(true)
  @Column({ type: DataType.STRING, unique: true, field: 'new_email_hash' })
  newEmailHash?: string | null;

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
