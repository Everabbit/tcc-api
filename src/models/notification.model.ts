import { Table, Column, Model, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { User, UserI } from './user.model';
import { NotificationType } from '../enums/notification_type.enum';

export interface NotificationMetadataI {
  inviterId?: number | undefined;
  inviterName?: string | undefined;
  projectId?: number | undefined;
  projectName?: string;
}

export interface NotificationI {
  id?: number;
  userId: number;
  user?: UserI;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: NotificationMetadataI;
  invitationToken?: string;
}

@Table({
  tableName: 'notifications',
  timestamps: true,
  underscored: true,
})
export class Notification extends Model implements NotificationI {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId!: number;

  @BelongsTo(() => User)
  user!: User;

  @Column({
    type: DataType.ENUM(...Object.values(NotificationType)),
    allowNull: false,
  })
  type!: NotificationType;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  message!: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isRead!: boolean;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  metadata?: NotificationMetadataI;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  invitationToken?: string;
}
