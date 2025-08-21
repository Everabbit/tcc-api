import { Server as SocketIOServer } from 'socket.io';
import { ResponseI } from '../interfaces/response.interface';
import { Notification, NotificationI } from '../models/notification.model';

export default class NotificationService {
  public static async create(
    notificationData: Omit<NotificationI, 'id' | 'isRead' | 'createdAt' | 'updatedAt'>,
    io: SocketIOServer
  ): Promise<ResponseI> {
    try {
      const newNotification = await Notification.create({
        ...notificationData,
        isRead: false,
      });

      io.to(notificationData.userId.toString()).emit('new_notification', newNotification);

      return {
        message: 'Notificação criada com sucesso.',
        success: true,
        data: newNotification,
      };
    } catch (err) {
      console.log(err);
      return {
        message: 'Erro ao criar notificação, consulte o Log.',
        success: false,
      };
    }
  }
}
