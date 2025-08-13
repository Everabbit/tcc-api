import { Application } from 'express';
import BasicMiddleware from '../middlewares/basic.middleware';
import CommentController from '../controllers/comment.controller';

export default class CommentRoute {
  private controller: CommentController = new CommentController();
  private middleware: BasicMiddleware = new BasicMiddleware();

  public createInstances(app: Application) {
    app.route('/comments/addcomment').post(this.middleware.validateToken, this.controller.addComment);
    app
      .route('/comments/removecomment/:commentId')
      .delete(this.middleware.validateToken, this.controller.removeComment);
    app.route('/comments/updatecomment').put(this.middleware.validateToken, this.controller.updateComment);
  }
}
