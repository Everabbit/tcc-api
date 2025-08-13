import { Application } from 'express';
import UserRoute from '../routes/user.route';
import ProjectRoute from '../routes/project.route';
import VersionRoute from '../routes/version.route';
import TaskRoute from '../routes/task.route';
import TagRoute from '../routes/tag.route';
import CommentRoute from '../routes/comment.route';

export class ExpressRouter {
  private userRoute: UserRoute = new UserRoute();
  private projectRoute: ProjectRoute = new ProjectRoute();
  private versionRoute: VersionRoute = new VersionRoute();
  private taskRoute: TaskRoute = new TaskRoute();
  private tagRoute: TagRoute = new TagRoute();
  private commentRoute: CommentRoute = new CommentRoute();

  public instanceRoutes(app: Application): void {
    this.userRoute.createInstances(app);
    this.projectRoute.createInstances(app);
    this.versionRoute.createInstances(app);
    this.taskRoute.createInstances(app);
    this.tagRoute.createInstances(app);
    this.commentRoute.createInstances(app);
  }
}
