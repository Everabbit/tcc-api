import { RolesEnum } from '../enums/roles.enum';
import UserService from '../services/user.service';

export const verifyPermission = async (projectId: number, userId: number, role: RolesEnum): Promise<boolean> => {
  const userRole = await UserService.getProjectRole(userId, projectId);
  if (!userRole.success) {
    return false;
  }

  if (userRole.data === RolesEnum.ADMIN) {
    return true;
  }

  if (userRole.data === RolesEnum.MANAGER) {
    return role === RolesEnum.MANAGER || role === RolesEnum.DEVELOPER || role === RolesEnum.ANALYST;
  }

  return userRole.data === role;
};
