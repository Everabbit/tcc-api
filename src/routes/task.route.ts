import { Application } from 'express';
import TaskController from '../controllers/task.controller';
import BasicMiddleware from '../middlewares/basic.middleware';
import { upload } from '../configs/upload';

export default class TaskRoute {
  private controller: TaskController = new TaskController();
  private middleware: BasicMiddleware = new BasicMiddleware();

  public createInstances(app: Application) {
    app
      .route('/tasks/create')
      .post(this.middleware.validateToken, upload.array('attachment'), this.controller.createTask);
    app
      .route('/tasks/update/:taskId')
      .put(this.middleware.validateToken, upload.array('attachment'), this.controller.updateTask);
    app.route('/tasks/delete/:taskId').delete(this.middleware.validateToken, this.controller.deleteTask);
    app.route('/tasks/getall/:versionId').get(this.middleware.validateToken, this.controller.getAllTasks);
    app.route('/tasks/updatestatus/:taskId').put(this.middleware.validateToken, this.controller.updateStatusTask);
    app.route('/tasks/get/:taskId').get(this.middleware.validateToken, this.controller.getTask);
    app.route('/tasks/addcomment').post(this.middleware.validateToken, this.controller.addComment);
    app.route('/tasks/removecomment/:commentId').delete(this.middleware.validateToken, this.controller.removeComment);
    app.route('/tasks/updatecomment').put(this.middleware.validateToken, this.controller.updateComment);
    app
      .route('/tasks/removeattachment/:attachmentId')
      .delete(this.middleware.validateToken, this.controller.deleteAttachment);
  }
}
