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
    app
      .route('/projects/update/:projectId')
      .put(this.middleware.validateToken, upload.single('banner'), this.controller.updateProject);
    app.route('/projects/remove/:projectId').delete(this.middleware.validateToken, this.controller.removeProject);

    app.route('/projects/list').get(this.middleware.validateToken, this.controller.getProjects);
    app.route('/projects/:projectId').get(this.middleware.validateToken, this.controller.getProject);
    app.route('/projects/adduser/:projectId').post(this.middleware.validateToken, this.controller.addUserOnProject);
    app
      .route('/projects/updateuser/:projectId')
      .put(this.middleware.validateToken, this.controller.updateUserOnProject);
    app
      .route('/projects/removeuser/:projectId/:participationId')
      .delete(this.middleware.validateToken, this.controller.removeUserFromProject);
    app.route('/projects/listmembers/:projectId').get(this.middleware.validateToken, this.controller.listMembers);
  }
}
