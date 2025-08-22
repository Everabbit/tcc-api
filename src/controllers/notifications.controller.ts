import { Response, Request } from 'express';
import { ResponseI } from '../interfaces/response.interface';
import ResponseValidator from '../utils/reponse.utils';
import { HttpStatus } from '../enums/res_status.enum';
import NotificationService from '../services/notification.service';

export default class NotificationController {
  public async getNotifications(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const userId: number = parseInt(req.params.userId);

      if (!userId) {
        response = { message: 'ID do usuário não fornecido.', success: false };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const notifications: ResponseI = await NotificationService.getAll(userId);

      if (!notifications.success) {
        response = {
          message: notifications.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      response = {
        message: 'Notificações encontradas com sucesso.',
        success: true,
        data: notifications.data,
      };
      return ResponseValidator.response(req, res, HttpStatus.OK, response);
    } catch (err) {
      console.log(err);
      const response: ResponseI = {
        message: `Erro: ${err}`,
        success: false,
      };
      return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
    }
  }

  public async getNotification(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const notificationId: number = parseInt(req.params.notificationId);

      if (!notificationId) {
        response = { message: 'ID da notificação não fornecido.', success: false };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const markAsRead: ResponseI = await NotificationService.markAsRead(notificationId);

      if (!markAsRead.success) {
        response = {
          message: markAsRead.message,
          success: false,
        };
      }

      const notification: ResponseI = await NotificationService.get(notificationId);

      if (!notification.success) {
        response = {
          message: notification.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.NOT_FOUND, response);
      }

      response = {
        message: 'Notificação encontrada com sucesso.',
        success: true,
        data: notification.data,
      };
      return ResponseValidator.response(req, res, HttpStatus.OK, response);
    } catch (err) {
      console.log(err);
      const response: ResponseI = {
        message: `Erro: ${err}`,
        success: false,
      };
      return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
    }
  }

  public async markAllRead(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const userId: number = parseInt(req.params.userId);

      if (!userId) {
        response = { message: 'ID do usuário não fornecido.', success: false };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const markAllReadResponse: ResponseI = await NotificationService.markAllRead(userId);

      if (!markAllReadResponse.success) {
        response = {
          message: markAllReadResponse.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      response = {
        message: 'Todas as notificações foram marcadas como lidas com sucesso.',
        success: true,
      };
      return ResponseValidator.response(req, res, HttpStatus.OK, response);
    } catch (err) {
      console.log(err);
      const response: ResponseI = {
        message: `Erro: ${err}`,
        success: false,
      };
      return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
    }
  }
}
