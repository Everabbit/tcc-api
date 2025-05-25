import { RolesEnum } from '../enums/roles.enum';

export interface ProjectCreateI {
  name: string;
  description?: string;
  deadline?: string;
  members?: ProjectMemberI[];
}

export interface ProjectMemberI {
  name?: string;
  email?: string;
  role?: RolesEnum;
}
