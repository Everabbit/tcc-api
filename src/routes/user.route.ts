import { Application } from 'express';
import UserController from '../controllers/user.controller';
import BasicMiddleware from '../middlewares/basic.middleware';

export default class UserRoute {
  private controller: UserController = new UserController();
  private middleware: BasicMiddleware = new BasicMiddleware();

  public createInstances(app: Application) {
    app.route('/users/register').post(this.controller.register);
    app.route('/users/validateToken').get(this.controller.validateToken);
    app.route('/users/login').post(this.controller.login);
    app.route('/users/basicinfo').get(this.middleware.validateToken, this.controller.getBasicInfoUser);
    app.route('/users/basicinfolist').get(this.middleware.validateToken, this.controller.getBasicUserList);
  }
}
