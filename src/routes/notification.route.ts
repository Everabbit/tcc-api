import { Application } from 'express';
import NotificationController from '../controllers/notifications.controller';
import BasicMiddleware from '../middlewares/basic.middleware';

export default class NotificationRoute {
  private controller: NotificationController = new NotificationController();
  private middleware: BasicMiddleware = new BasicMiddleware();

  public createInstances(app: Application) {
    app.route('/notifications/:userId').get(this.middleware.validateToken, this.controller.getNotifications);
  }
}
