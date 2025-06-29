import { VersionStatusEnum } from '../enums/status.enum';

export interface VersionCreateI {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: VersionStatusEnum;
  projectId: number;
}
