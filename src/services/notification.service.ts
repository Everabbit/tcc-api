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

      if (io) {
        io.to(notificationData.userId.toString()).emit('newNotification', newNotification);
        console.log(`Evento 'newNotification' emitido para o usuário: ${notificationData.userId}`);
      }

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

  public static async get(notificationId: number): Promise<ResponseI> {
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

      response = {
        message: 'Notificação encontrada com sucesso.',
        success: true,
        data: notification,
      };
      return response;
    } catch (err) {
      console.log(err);
      return {
        message: 'Erro ao buscar notificação, consulte o Log.',
        success: false,
      };
    }
  }

  public static async removeInvitationToken(invitationToken: string): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!invitationToken) {
        response = { message: 'ID da notificação não fornecido.', success: false };
        return response;
      }

      const [rowsAffected] = await Notification.update(
        { invitationToken: null, isRead: true },
        {
          where: { invitationToken },
        }
      );

      if (rowsAffected === 0) {
        response = { message: 'Notificação não encontrada.', success: false };
        return response;
      }

      response = {
        message: 'Token de convite removido com sucesso.',
        success: true,
      };
      return response;
    } catch (err) {
      console.log(err);
      return {
        message: 'Erro ao remover token de convite, consulte o Log.',
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

  public static async markAllRead(userId: number): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!userId) {
        response = { message: 'ID do usuário não fornecido.', success: false };
        return response;
      }

      await Notification.update(
        { isRead: true },
        {
          where: { userId: userId, isRead: false },
        }
      );

      response = {
        message: 'Todas as notificações foram marcadas como lidas.',
        success: true,
      };
      return response;
    } catch (err) {
      console.log(err);
      return {
        message: 'Erro ao marcar notificações como lidas, consulte o Log.',
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

      const [rowsAffected] = await Notification.update(
        { isRead: true },
        {
          where: { id: notificationId, isRead: false },
        }
      );

      if (rowsAffected === 0) {
        response = { message: 'Notificação não encontrada ou já marcada como lida.', success: false };
        return response;
      }

      response = {
        message: 'Notificação marcada como lida com sucesso.',
        success: true,
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
}
