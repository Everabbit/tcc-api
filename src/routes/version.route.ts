import { Application } from 'express';
import VersionController from '../controllers/version.controller';
import BasicMiddleware from '../middlewares/basic.middleware';

export default class VersionRoute {
  private controller: VersionController = new VersionController();
  private middleware: BasicMiddleware = new BasicMiddleware();

  public createInstances(app: Application) {
    app.route('/versions/create').post(this.middleware.validateToken, this.controller.createVersion);
    app.route('/versions/update/:versionId').put(this.middleware.validateToken, this.controller.updateVersion);
    app.route('/versions/get/:projectId/:versionId').get(this.middleware.validateToken, this.controller.getOneVersion);
    app.route('/versions/list/:projectId').get(this.middleware.validateToken, this.controller.getAllVersions);
  }
}
