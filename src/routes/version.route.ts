import { Application } from 'express';
import VersionController from '../controllers/version.controller';
import BasicMiddleware from '../middlewares/basic.middleware';

export default class VersionRoute {
  private controller: VersionController = new VersionController();
  private middleware: BasicMiddleware = new BasicMiddleware();

  public createInstances(app: Application) {
    app.route('/versions/create').post(this.middleware.validateToken, this.controller.createVersion);
  }
}
