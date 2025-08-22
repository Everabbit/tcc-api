import { Application } from 'express';
import NotificationController from '../controllers/notifications.controller';
import BasicMiddleware from '../middlewares/basic.middleware';

export default class NotificationRoute {
  private controller: NotificationController = new NotificationController();
  private middleware: BasicMiddleware = new BasicMiddleware();

  public createInstances(app: Application) {
    app.route('/notifications').get(this.middleware.validateToken, this.controller.getNotifications);
    app
      .route('/notifications/read/:notificationId')
      .put(this.middleware.validateToken, this.controller.getNotification);
    app.route('/notifications/readall').put(this.middleware.validateToken, this.controller.markAllRead);
  }
}
