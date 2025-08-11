import { Application } from 'express';
import UserController from '../controllers/user.controller';
import BasicMiddleware from '../middlewares/basic.middleware';
import { upload } from '../configs/upload';

export default class UserRoute {
  private controller: UserController = new UserController();
  private middleware: BasicMiddleware = new BasicMiddleware();

  public createInstances(app: Application) {
    app.route('/users/register').post(this.controller.register);
    app.route('/users/validateToken').get(this.controller.validateToken);
    app.route('/users/login').post(this.controller.login);
    app.route('/users/update').put(this.middleware.validateToken, this.controller.updateUser);
    app.route('/users/delete').delete(this.middleware.validateToken, this.controller.deleteUser);
    app.route('/users/updatepassword').put(this.middleware.validateToken, this.controller.updatePassword);
    app.route('/users/settings').get(this.middleware.validateToken, this.controller.getUserSettings);
    app
      .route('/users/updateimage')
      .put(this.middleware.validateToken, upload.single('image'), this.controller.updateImage);
    app.route('/users/removeimage').delete(this.middleware.validateToken, this.controller.removeImage);
    app.route('/users/updatepreferences').put(this.middleware.validateToken, this.controller.updatePreferences);
    app.route('/users/preferences').get(this.middleware.validateToken, this.controller.getPreferences);
    app.route('/users/basicinfo').get(this.middleware.validateToken, this.controller.getBasicInfoUser);
    app.route('/users/basicinfolist/:username').get(this.middleware.validateToken, this.controller.getBasicUserList);
    app.route('/users/role/:projectId').get(this.middleware.validateToken, this.controller.getUserRole);
  }
}
