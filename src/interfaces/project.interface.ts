import { ProjectStatus } from '../enums/project_status.enum';
import { RolesEnum } from '../enums/roles.enum';
import { ProjectParticipationI } from '../models/project_participation.model';

export interface ProjectCreateI {
  name: string;
  description?: string;
  deadline?: string;
  status: ProjectStatus;
  members?: ProjectParticipationI[];
}

export interface ProjectMemberI {
  id?: number;
  username?: string;
  image?: string;
  initials?: string;
  role?: RolesEnum;
}
