import { Application } from 'express';
import ProjectController from '../controllers/project.controller';
import BasicMiddleware from '../middlewares/basic.middleware';
import { upload } from '../configs/upload';

export default class ProjectRoute {
  private controller: ProjectController = new ProjectController();
  private middleware: BasicMiddleware = new BasicMiddleware();

  public createInstances(app: Application) {
    app
      .route('/projects/create')
      .post(this.middleware.validateToken, upload.single('banner'), this.controller.createProject);

    app.route('/projects/list').get(this.middleware.validateToken, this.controller.getProjects);
    app.route('/projects/:projectId').get(this.middleware.validateToken, this.controller.getProject);
  }
}
