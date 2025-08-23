import { NotificationI } from '../models/notification.model';
import { ProjectI } from '../models/project.model';

export interface DashboardI {
  stats: DashboardStatI[];
  projects: ProjectI[];
  notifications: NotificationI[];
}

export interface DashboardStatI {
  title: string;
  value: string;
  icon: string;
  color: string;
  link: string;
}
