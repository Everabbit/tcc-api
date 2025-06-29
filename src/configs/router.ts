import { Application } from 'express';
import UserRoute from '../routes/user.route';
import ProjectRoute from '../routes/project.route';
import VersionRoute from '../routes/version.route';

export class ExpressRouter {
  private userRoute: UserRoute = new UserRoute();
  private projectRoute: ProjectRoute = new ProjectRoute();
  private versionRoute: VersionRoute = new VersionRoute();

  public instanceRoutes(app: Application): void {
    this.userRoute.createInstances(app);
    this.projectRoute.createInstances(app);
    this.versionRoute.createInstances(app);
  }
}
