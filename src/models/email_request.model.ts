import { AllowNull, AutoIncrement, Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { createSearchableHash, decrypt, encrypt } from '../helpers/encryption.helper';

export interface EmailRequestI {
  id?: number;
  email: string;
  emailHash?: string | null;
  hash: string;
  sentDate: Date;
  accepted: boolean;
}

@Table({
  tableName: 'email_request',
  timestamps: true,
  underscored: true,
})
export class EmailRequest extends Model implements EmailRequestI {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  id?: number;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    get(this: EmailRequest) {
      const rawValue = this.getDataValue('email');
      return decrypt(rawValue);
    },
    set(this: EmailRequest, value: string) {
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
  hash!: string;

  @AllowNull(false)
  @Column({ type: DataType.DATE })
  sentDate!: Date;

  @AllowNull(false)
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  accepted!: boolean;
}
