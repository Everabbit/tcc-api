import { Application } from 'express';
import UserController from '../controllers/user.controller';

export default class UserRoute {
  private controller: UserController = new UserController();

  public createInstances(app: Application) {
    app.route('/users/register').post(this.controller.register);
    app.route('/users/validateToken').get(this.controller.validateToken);
    app.route('/users/login').post(this.controller.login);
  }
}
