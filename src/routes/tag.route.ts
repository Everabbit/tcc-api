import { Application } from 'express';
import TagController from '../controllers/tag.controller';
import BasicMiddleware from '../middlewares/basic.middleware';

export default class TagRoute {
  private controller: TagController = new TagController();
  private middleware: BasicMiddleware = new BasicMiddleware();

  public createInstances(app: Application) {
    app.route('/tags/createtag').post(this.middleware.validateToken, this.controller.createTag);
    app.route('/tags/updatetag').put(this.middleware.validateToken, this.controller.updateTag);
    app.route('/tags/deletetag/:projectId/:tagId').delete(this.middleware.validateToken, this.controller.deleteTag);
    app.route('/tags/getall/:projectId').get(this.middleware.validateToken, this.controller.getAllTags);
  }
}
