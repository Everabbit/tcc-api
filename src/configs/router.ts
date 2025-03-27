import { Application } from 'express';
import UserRoute from '../routes/user.route';
import ProjectRoute from '../routes/project.route';

export class ExpressRouter {
  private userRoute: UserRoute = new UserRoute();
  private projectRoute: ProjectRoute = new ProjectRoute();

  public instanceRoutes(app: Application): void {
    this.userRoute.createInstances(app);
    this.projectRoute.createInstances(app);
  }
}
