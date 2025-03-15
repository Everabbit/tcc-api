import { Application } from 'express';
import UserRoute from '../routes/user.route';

export class ExpressRouter {
  private userRoute: UserRoute = new UserRoute();

  public instanceRoutes(app: Application): void {
    this.userRoute.createInstances(app);
  }
}
