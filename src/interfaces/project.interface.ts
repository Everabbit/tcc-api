import { RolesEnum } from '../enums/roles.enum';

export interface ProjectCreateI {
  name: string;
  description?: string;
  deadline?: string;
  members?: ProjectMemberI[];
}

export interface ProjectMemberI {
  id?: number;
  username?: string;
  image?: string;
  initials?: string;
  role?: RolesEnum;
}
