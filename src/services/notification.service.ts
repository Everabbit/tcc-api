import { Server as SocketIOServer } from 'socket.io';
import { ResponseI } from '../interfaces/response.interface';
import { Notification, NotificationI } from '../models/notification.model';

export default class NotificationService {
  public static async create(
    notificationData: Omit<NotificationI, 'id' | 'isRead' | 'createdAt' | 'updatedAt'>,
    io: SocketIOServer
  ): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (
        !notificationData ||
        !notificationData.userId ||
        !notificationData.type ||
        !notificationData.title ||
        !notificationData.message
      ) {
        response = { message: 'Dados de notificação incompletos.', success: false };
        return response;
      }
      const newNotification = await Notification.create({
        ...notificationData,
        isRead: false,
      });

      io.to(notificationData.userId.toString()).emit('new_notification', newNotification);

      response = {
        message: 'Notificação criada com sucesso.',
        success: true,
        data: newNotification,
      };
      return response;
    } catch (err) {
      console.log(err);
      return {
        message: 'Erro ao criar notificação, consulte o Log.',
        success: false,
      };
    }
  }

  public static async getAll(userId: number): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!userId) {
        response = { message: 'ID do usuário não fornecido.', success: false };
        return response;
      }

      const notifications = await Notification.findAll({
        where: { userId: userId },
        order: [['createdAt', 'DESC']],
      });

      response = {
        message: 'Notificações encontradas com sucesso.',
        success: true,
        data: notifications,
      };
      return response;
    } catch (err) {
      console.log(err);
      return {
        message: 'Erro ao buscar notificações, consulte o Log.',
        success: false,
      };
    }
  }

  public static async markAsRead(notificationId: number): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!notificationId) {
        response = { message: 'ID da notificação não fornecido.', success: false };
        return response;
      }

      const notification = await Notification.findByPk(notificationId);

      if (!notification) {
        response = { message: 'Notificação não encontrada.', success: false };
        return response;
      }

      await notification.update({ isRead: true });

      response = {
        message: 'Notificação marcada como lida com sucesso.',
        success: true,
        data: notification,
      };
      return response;
    } catch (err) {
      console.log(err);
      return {
        message: 'Erro ao marcar notificação como lida, consulte o Log.',
        success: false,
      };
    }
  }

  public static async delete(notificationId: number): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!notificationId) {
        response = { message: 'ID da notificação não fornecido.', success: false };
        return response;
      }

      const deletedRows = await Notification.destroy({
        where: { id: notificationId },
      });

      if (deletedRows === 0) {
        response = { message: 'Notificação não encontrada.', success: false };
        return response;
      }

      response = {
        message: 'Notificação excluída com sucesso.',
        success: true,
      };
      return response;
    } catch (err) {
      console.log(err);
      return {
        message: 'Erro ao excluir notificação, consulte o Log.',
        success: false,
      };
    }
  }
}
