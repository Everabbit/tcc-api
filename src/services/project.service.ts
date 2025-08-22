import { ResponseI } from '../interfaces/response.interface';
import { Project, ProjectI } from '../models/project.model';
import { ProjectParticipation, ProjectParticipationI } from '../models/project_participation.model';
import { User } from '../models/user.model';
import { Version } from '../models/version.model';
import { Task } from '../models/task.models';
import { TaskStatusEnum } from '../enums/status.enum';
import { clone } from '../utils/utils';
import * as crypto from 'crypto';
import { Server as SocketIOServer } from 'socket.io';
import NotificationService from './notification.service';
import EmailService from './email.service';
import { NotificationType } from '../enums/notification_type.enum';
import { RolesEnum, RolesValues } from '../enums/roles.enum';
import { toBase64 } from 'openai/core';
import { Notification, NotificationI } from '../models/notification.model';

export default class ProjectService {
  public static async create(project: ProjectI): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };
      if (!project || !project.name) {
        response = {
          message: 'Projeto inválido, verifique os dados.',
          success: false,
        };
        return response;
      }

      const newProject = await Project.create({
        name: project.name,
        creatorId: project.creatorId,
        description: project.description,
        status: project.status,
        banner: project.banner,
        deadline: project.deadline,
        progress: project.progress,
      });
      if (!newProject) {
        response = {
          message: 'Erro ao criar projeto, consulte o Log.',
          success: false,
        };
        return response;
      }
      response = {
        message: 'Projeto criado com sucesso.',
        success: true,
        data: newProject,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao buscar informações do usuário, consulte o Log.',
        success: false,
      };
      return response;
    }
  }

  public static async update(project: ProjectI): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!project || !project.id) {
        response = {
          message: 'Projeto inválido, verifique os dados.',
          success: false,
        };
        return response;
      }

      const projectExists = await Project.findOne({ where: { id: project.id } });
      if (!projectExists) {
        response = {
          message: 'Projeto não encontrado.',
          success: false,
        };
        return response;
      }

      const [rowsAffected, [updatedProject]] = await Project.update(
        {
          name: project.name,
          description: project.description,
          status: project.status,
          banner: project.banner,
          deadline: project.deadline,
          progress: project.progress,
        },
        { where: { id: project.id }, returning: true }
      );

      if (rowsAffected === 0) {
        response = {
          message: 'Nenhum projeto foi atualizado.',
          success: false,
        };
        return response;
      }

      const getProject = await Project.findOne({
        where: { id: project.id },
        include: [
          {
            model: Version,
            include: [
              {
                model: Task,
                attributes: ['id', 'status'],
              },
            ],
          },
        ],
      });

      if (!getProject) {
        response = {
          message: 'Projeto não encontrado após atualização.',
          success: false,
        };
        return response;
      }

      let totalTasks = 0;
      let completedTasks = 0;

      if (getProject.versions) {
        for (const version of getProject.versions) {
          if (version.tasks) {
            totalTasks += version.tasks.length;
            completedTasks += version.tasks.filter(task => task.status === TaskStatusEnum.DONE).length;
          }
        }
      }

      getProject.dataValues.progress = totalTasks > 0 ? completedTasks / totalTasks : 0;

      response = {
        message: 'Projeto atualizado com sucesso.',
        success: true,
        data: getProject,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao atualizar projeto, consulte o Log.',
        success: false,
      };
      return response;
    }
  }

  public static async remove(projectId: number, userId: number): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!projectId) {
        response = {
          message: 'Id do projeto não informado.',
          success: false,
        };
        return response;
      }

      const projectExists = await Project.findOne({ where: { id: projectId, creatorId: userId } });
      if (!projectExists) {
        response = {
          message: 'Projeto não encontrado.',
          success: false,
        };
        return response;
      }

      const deletedRows = await Project.destroy({
        where: { id: projectExists.id },
      });

      if (deletedRows === 0) {
        response = {
          message: 'Nenhum projeto foi removido.',
          success: false,
        };
        return response;
      }

      response = {
        message: 'Projeto removido com sucesso.',
        success: true,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao remover projeto, consulte o Log.',
        success: false,
      };
      return response;
    }
  }

  public static async get(projectId: number, userId: number): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!projectId) {
        response = {
          message: 'Id do projeto não informado.',
          success: false,
        };
        return response;
      }

      const project = await Project.findOne({
        where: { id: projectId },
        include: [
          {
            model: ProjectParticipation,
          },
          {
            model: Version,
            include: [
              {
                model: Task,
                attributes: ['id', 'status'],
              },
            ],
          },
        ],
      });

      if (!project) {
        response = {
          message: 'Projeto não encontrado.',
          success: false,
        };
        return response;
      }

      const isCreator = project.creatorId === userId;
      const isParticipant = project.participation?.some(
        (participation: ProjectParticipationI) => participation.userId === userId
      );

      if (!isCreator && !isParticipant) {
        response = {
          message: 'Você não tem permissão para acessar este projeto.',
          success: false,
        };
        return response;
      }

      let totalTasks = 0;
      let completedTasks = 0;

      if (project.versions) {
        for (const version of project.versions) {
          if (version.tasks) {
            totalTasks += version.tasks.length;
            completedTasks += version.tasks.filter(task => task.status === TaskStatusEnum.DONE).length;
          }
        }
      }

      project.dataValues.progress = totalTasks > 0 ? completedTasks / totalTasks : 0;

      response = {
        message: 'Projeto encontrado com sucesso.',
        success: true,
        data: project,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao buscar projeto, consulte o Log.',
        success: false,
      };
      return response;
    }
  }

  public static async list(userId: number): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const projects = await Project.findAll({
        include: [
          {
            model: ProjectParticipation,
            include: [
              {
                model: User,
                attributes: ['id', 'username', 'image'],
              },
            ],
          },
          {
            model: Version,
            include: [
              {
                model: Task,
                attributes: ['id', 'status'],
              },
            ],
          },
        ],
      });

      if (!projects) {
        response = {
          message: 'Nenhum projeto encontrado.',
          success: false,
        };
        return response;
      }

      const plainProjects: ProjectI[] = clone(projects);

      const filteredProjects: ProjectI[] = plainProjects.filter(project => {
        const isCreator = project.creatorId === userId;
        const isParticipant = project.participation?.some(
          (participation: ProjectParticipationI) => participation.userId === userId && participation.accepted
        );
        return isCreator || isParticipant;
      });

      if (filteredProjects.length === 0) {
        response = {
          message: 'Projetos encontrados com sucesso.',
          success: true,
          data: filteredProjects,
        };
        return response;
      }

      for (const project of filteredProjects) {
        let totalTasks = 0;
        let completedTasks = 0;

        if (project.versions) {
          for (const version of project.versions) {
            if (version.tasks) {
              totalTasks += version.tasks.length;
              completedTasks += version.tasks.filter(task => task.status === TaskStatusEnum.DONE).length;
            }
          }
        }

        project.progress = totalTasks > 0 ? completedTasks / totalTasks : 0;
      }

      response = {
        message: 'Projetos encontrados com sucesso.',
        success: true,
        data: filteredProjects,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao buscar projetos, consulte o Log.',
        success: false,
      };
      return response;
    }
  }

  public static async addUserOnProject(projectId: number, projectMember: ProjectParticipationI): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!projectId || !projectMember || !projectMember.userId || typeof projectMember.role !== 'number') {
        response = {
          message: 'Dados incompletos para adicionar membro ao projeto.',
          success: false,
        };
        return response;
      }

      const existingParticipation = await ProjectParticipation.findOne({
        where: { userId: projectMember.userId, projectId },
      });

      if (existingParticipation) {
        response = {
          message: existingParticipation.accepted
            ? 'Usuário já participa deste projeto.'
            : 'Um convite já foi enviado para este usuário.',
          success: false,
        };
        return response;
      }

      const newProjectMember = await ProjectParticipation.create({
        userId: projectMember.userId,
        projectId: projectId,
        role: projectMember.role,
        invitedAt: new Date(),
        accepted: true,
      });

      if (!newProjectMember) {
        response = {
          message: 'Erro ao adicionar membro ao projeto, consulte o Log.',
          success: false,
        };
        return response;
      }

      const addedMemberWithUser = await ProjectParticipation.findOne({
        where: { id: newProjectMember.id },
        include: [{ model: User, attributes: ['id', 'fullName', 'username', 'image'] }],
      });

      if (!addedMemberWithUser) {
        response = {
          message: 'Membro adicionado, mas não foi possível buscar os dados completos.',
          success: false,
        };
        return response;
      }

      response = {
        message: 'Membro adicionado ao projeto com sucesso.',
        success: true,
        data: addedMemberWithUser,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao adicionar membro ao projeto, consulte o Log.',
        success: false,
      };
      return response;
    }
  }

  public static async inviteUserToProject(
    projectId: number,
    projectMember: ProjectParticipationI,
    inviterId: number,
    io: SocketIOServer
  ): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!projectId || !projectMember || !projectMember.userId || typeof projectMember.role !== 'number') {
        response = {
          message: 'Dados incompletos para convidar usuário para o projeto.',
          success: false,
        };
        return response;
      }

      const project = await Project.findByPk(projectId);
      if (!project) {
        response = { message: 'Projeto não encontrado.', success: false };
        return response;
      }

      const userToInvite = await User.findByPk(projectMember.userId);
      if (!userToInvite) {
        response = { message: 'Usuário a ser convidado não encontrado.', success: false };
        return response;
      }

      const existingParticipation = await ProjectParticipation.findOne({
        where: { userId: projectMember.userId, projectId },
      });

      if (existingParticipation) {
        response = {
          message: existingParticipation.accepted
            ? 'Usuário já participa deste projeto.'
            : 'Um convite já foi enviado para este usuário.',
          success: false,
        };
        return response;
      }

      const inviter = await User.findByPk(inviterId);
      if (!inviter) {
        response = { message: 'Convidador não encontrado.', success: false };
        return response;
      }

      const invitationToken = crypto.randomBytes(32).toString('hex');

      const newProjectMember = await ProjectParticipation.create({
        userId: projectMember.userId,
        projectId: projectId,
        role: projectMember.role,
        accepted: false,
        invitedAt: new Date(),
        invitationToken: invitationToken,
      });

      const message: string = `Você foi convidado para participar do projeto "${project.name}" como ${
        RolesValues.find(role => {
          return role.id === projectMember.role;
        })?.name
      }.`;

      const notification = await NotificationService.create(
        {
          userId: userToInvite.id!,
          type: NotificationType.PROJECT_INVITATION,
          title: 'Convite para Projeto',
          message,
          invitationToken,
          metadata: {
            projectId: project.id,
            projectName: project.name,
            inviterId: inviter.id,
            inviterName: inviter.fullName,
          },
        },
        io
      );

      if (!notification.success) {
        response = { message: 'Erro ao enviar convite.', success: false };
        return response;
      }

      EmailService.sendEmail(userToInvite.email, 'Você foi convidado para um projeto!', 'project_invitation', {
        fullName: userToInvite.fullName,
        inviterName: inviter.fullName,
        projectName: project.name,
        acceptUrl: `${process.env.FRONT_END_URL}/p/notificacoes/${toBase64(notification.data.id.toString())}`,
      });

      const addedMemberWithUser = await ProjectParticipation.findOne({
        where: { id: newProjectMember.id },
        include: [{ model: User, attributes: ['id', 'fullName', 'username', 'image'] }],
      });

      if (!addedMemberWithUser) {
        response = {
          message: 'Membro adicionado, mas não foi possível buscar os dados completos.',
          success: false,
        };
        return response;
      }

      response = {
        message: 'Convite enviado com sucesso.',
        success: true,
        data: newProjectMember,
      };

      return response;
    } catch (err) {
      console.log(err);
      return { message: 'Erro ao convidar usuário para o projeto, consulte o Log.', success: false };
    }
  }

  public static async acceptInvitation(invitationToken: string, userId: number): Promise<ResponseI> {
    try {
      if (!invitationToken) {
        return { message: 'Token de convite inválido.', success: false };
      }

      const participation = await ProjectParticipation.findOne({
        where: { invitationToken: invitationToken, userId: userId },
        include: [Project, User],
      });

      if (!participation) {
        return { message: 'Convite não encontrado ou inválido para este usuário.', success: false };
      }

      await participation.update({
        accepted: true,
        acceptedAt: new Date(),
        invitationToken: null,
      });

      return {
        message: `Você agora faz parte do projeto "${participation.project?.name}".`,
        success: true,
        data: participation,
      };
    } catch (err) {
      console.log(err);
      return { message: 'Erro ao aceitar convite, consulte o Log.', success: false };
    }
  }

  public static async updateUserOnProject(projectId: number, projectMember: ProjectParticipationI): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!projectId || !projectMember || !projectMember.userId || typeof projectMember.role !== 'number') {
        response = {
          message: 'Dados incompletos para atualizar membro do projeto.',
          success: false,
        };
        return response;
      }

      const userExists: ProjectParticipationI | null = await ProjectParticipation.findOne({
        where: { userId: projectMember.userId, projectId },
      });

      if (!userExists) {
        response = {
          message: 'Usuário não encontrado neste projeto.',
          success: false,
        };
        return response;
      }

      const [rowsAffected, [updatedMember]] = await ProjectParticipation.update(
        {
          role: projectMember.role,
        },
        { where: { userId: projectMember.userId, projectId }, returning: true }
      );

      if (rowsAffected === 0) {
        response = {
          message: 'Nenhum membro foi atualizado.',
          success: false,
        };
        return response;
      }

      const updatedMemberWithUser = await ProjectParticipation.findOne({
        where: { id: updatedMember.id },
        include: [{ model: User, attributes: ['id', 'fullName', 'username', 'image'] }],
      });

      if (!updatedMemberWithUser) {
        response = {
          message: 'Membro atualizado, mas não foi possível buscar os dados completos.',
          success: false,
        };
        return response;
      }

      response = {
        message: 'Membro do projeto atualizado com sucesso.',
        success: true,
        data: updatedMemberWithUser,
      };

      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao atualizar membro do projeto, consulte o Log.',
        success: false,
      };
      return response;
    }
  }

  public static async removeUserFromProject(projectId: number, userId: number): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!projectId || !userId) {
        response = {
          message: 'Dados incompletos para remover membro do projeto.',
          success: false,
        };
        return response;
      }

      const userExists: ProjectParticipationI | null = await ProjectParticipation.findOne({
        where: { userId: userId, projectId },
      });

      if (!userExists) {
        response = {
          message: 'Usuário não encontrado neste projeto.',
          success: false,
        };
        return response;
      }

      if (userExists.invitationToken) {
        await NotificationService.removeInvitationToken(userExists.invitationToken);
      }

      const projectMember: number | null = await ProjectParticipation.destroy({
        where: { userId: userId, projectId: projectId },
      });

      if (!projectMember) {
        response = {
          message: 'Usuário não encontrado neste projeto.',
          success: false,
        };
        return response;
      }

      response = {
        message: 'Membro removido do projeto com sucesso.',
        success: true,
      };

      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao remover usuário do projeto, consulte o Log.',
        success: false,
      };
      return response;
    }
  }

  public static async listMembers(projectId: number): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!projectId) {
        response = {
          message: 'Id do projeto não informado.',
          success: false,
        };
        return response;
      }

      const members: ProjectParticipationI[] = await ProjectParticipation.findAll({
        where: { projectId: projectId },
        include: [
          {
            model: User,
            attributes: ['id', 'fullName', 'username', 'image'],
          },
        ],
        order: [
          ['role', 'ASC'],
          ['invitedAt', 'ASC'],
        ],
      });

      if (!members || members.length === 0) {
        response = {
          message: 'Nenhum membro encontrado para este projeto.',
          success: false,
        };
        return response;
      }

      response = {
        message: 'Membros encontrados com sucesso.',
        success: true,
        data: members,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao buscar membros do projeto, consulte o Log.',
        success: false,
      };
      return response;
    }
  }
}
