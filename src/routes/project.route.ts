import { Application } from 'express';
import ProjectController from '../controllers/project.controller';
import BasicMiddleware from '../middlewares/basic.middleware';

export default class ProjectRoute {
  private controller: ProjectController = new ProjectController();
  private middleware: BasicMiddleware = new BasicMiddleware();

  public createInstances(app: Application) {
    app.route('/projects/create').post(this.middleware.validateToken, this.controller.createProject);
  }
}
