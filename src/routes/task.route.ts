import { Application } from 'express';
import TaskController from '../controllers/task.controller';
import BasicMiddleware from '../middlewares/basic.middleware';
import { upload } from '../configs/upload';

export default class TaskRoute {
  private controller: TaskController = new TaskController();
  private middleware: BasicMiddleware = new BasicMiddleware();

  public createInstances(app: Application) {
    app
      .route('/tasks/create/:projectId')
      .post(this.middleware.validateToken, upload.array('attachment'), this.controller.createTask);
    app
      .route('/tasks/update/:projectId/:taskId')
      .put(this.middleware.validateToken, upload.array('attachment'), this.controller.updateTask);
    app.route('/tasks/delete/:projectId/:taskId').delete(this.middleware.validateToken, this.controller.deleteTask);
    app.route('/tasks/getall/:versionId').get(this.middleware.validateToken, this.controller.getAllTasks);
    app.route('/tasks/updatestatus/:taskId').put(this.middleware.validateToken, this.controller.updateStatusTask);
    app.route('/tasks/get/:taskId').get(this.middleware.validateToken, this.controller.getTask);
    app
      .route('/tasks/removeattachment/:projectId/:attachmentId')
      .delete(this.middleware.validateToken, this.controller.deleteAttachment);
    app.route('/tasks/history/:taskId').get(this.middleware.validateToken, this.controller.getHistory);
  }
}
