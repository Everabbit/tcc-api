import { RolesEnum } from '../enums/roles.enum';
import UserService from '../services/user.service';

export const verifyPermission = async (projectId: number, userId: number, role: RolesEnum): Promise<boolean> => {
  const userRole = await UserService.getProjectRole(userId, projectId);
  if (!userRole.success) {
    return false;
  }

  return userRole.data <= role;
};
