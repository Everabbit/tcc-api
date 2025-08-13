import { Request, Response } from 'express';
import { ResponseI } from '../interfaces/response.interface';
import ResponseValidator from '../utils/reponse.utils';
import { HttpStatus } from '../enums/res_status.enum';
import ProjectService from '../services/project.service';
import { ProjectI } from '../models/project.model';
import { ProjectCreateI, ProjectMemberI } from '../interfaces/project.interface';
import { ProjectStatus } from '../enums/project_status.enum';
import { deleteFile, uploadFile } from '../utils/files.utils';
import { RolesEnum } from '../enums/roles.enum';
import { verifyPermission } from '../utils/roles.utils';
import { ProjectParticipationI } from '../models/project_participation.model';
import UserService from '../services/user.service';
import { User } from '../models/user.model';

export default class ProjectController {
  public async createProject(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const userId: number = parseInt(req.params.userId);
      const project: ProjectCreateI = JSON.parse(req.body.project);
      const banner: Express.Multer.File | undefined = req.file;

      if (!project || !project.name) {
        response = {
          message: 'Dados incompletos para criar projeto.',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      if (!userId) {
        response = {
          message: 'Id do usuário não informado!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      let bannerUploadUrl: string = '';

      if (banner) {
        bannerUploadUrl = await uploadFile(banner);
      }

      const newProject: ProjectI = {
        creatorId: userId,
        name: project.name,
        description: project.description,
        status: ProjectStatus.ACTIVE,
        banner: bannerUploadUrl,
        deadline: project.deadline ? new Date(project.deadline) : undefined,
        progress: 0,
      };

      const projectCreated: ResponseI = await ProjectService.create(newProject);

      if (!projectCreated.success) {
        response = {
          message: projectCreated.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      const admin: ProjectParticipationI = {
        role: RolesEnum.ADMIN,
        userId: userId,
      };
      const adminAdded: ResponseI = await ProjectService.addUserOnProject(projectCreated.data.id, admin);
      if (!adminAdded.success) {
        response = {
          message: adminAdded.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      //adicionar outros usuários
      if (project.members) {
        project.members.forEach(async element => {
          const user: ResponseI = await ProjectService.addUserOnProject(projectCreated.data.id, element);
        });
      }

      response = {
        message: 'Projeto criado com sucesso!',
        success: true,
        data: projectCreated.data,
      };
      return ResponseValidator.response(req, res, HttpStatus.OK, response);
    } catch (err) {
      console.log(err);
      const response: ResponseI = {
        message: `Erro: ${err}`,
        success: false,
      };
      return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
    }
  }

  public async updateProject(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const userId: number = parseInt(req.params.userId);
      const projectId: number = parseInt(req.params.projectId);
      const project: ProjectI = JSON.parse(req.body.project);
      const banner: Express.Multer.File | undefined = req.file;

      const hasPermission: boolean = await verifyPermission(projectId, userId, RolesEnum.ADMIN);

      if (!hasPermission) {
        response = {
          message: 'Você não tem permissão para atualizar este projeto.',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.UNAUTHORIZED, response);
      }

      if (!projectId) {
        response = {
          message: 'Id do projeto não informado!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      let bannerUploadUrl: string | undefined = project.banner;

      if (banner) {
        if (bannerUploadUrl) {
          await deleteFile(bannerUploadUrl);
        }
        bannerUploadUrl = await uploadFile(banner);
      } else {
        bannerUploadUrl = undefined;
      }

      const updatedProject: ProjectI = {
        id: projectId,
        creatorId: project.creatorId,
        name: project.name,
        description: project.description,
        status: project.status,
        banner: bannerUploadUrl,
        deadline: project.deadline ? new Date(project.deadline) : undefined,
        progress: project.progress,
      };

      const projectUpdated: ResponseI = await ProjectService.update(updatedProject);

      if (!projectUpdated.success) {
        response = {
          message: projectUpdated.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      const io = (req as any).io;

      if (io) {
        io.to(projectId).emit('projectUpdated', projectUpdated.data);
        console.log(`Evento 'projectUpdated' emitido para a sala: ${projectId}`);
      }

      response = {
        message: 'Projeto atualizado com sucesso!',
        success: true,
        data: projectUpdated.data,
      };
      return ResponseValidator.response(req, res, HttpStatus.OK, response);
    } catch (err) {
      console.log(err);
      const response: ResponseI = {
        message: `Erro: ${err}`,
        success: false,
      };
      return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
    }
  }

  public async removeProject(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const userId: number = parseInt(req.params.userId);
      const projectId: number = parseInt(req.params.projectId);

      const hasPermission: boolean = await verifyPermission(projectId, userId, RolesEnum.ADMIN);

      if (!hasPermission) {
        response = {
          message: 'Você não tem permissão para remover este projeto.',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.UNAUTHORIZED, response);
      }

      if (!projectId) {
        response = {
          message: 'Id do projeto não informado!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const projectRemoved: ResponseI = await ProjectService.remove(projectId, userId);

      if (!projectRemoved.success) {
        response = {
          message: projectRemoved.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      response = {
        message: 'Projeto removido com sucesso!',
        success: true,
      };
      return ResponseValidator.response(req, res, HttpStatus.OK, response);
    } catch (err) {
      console.log(err);
      const response: ResponseI = {
        message: `Erro: ${err}`,
        success: false,
      };
      return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
    }
  }

  public async getProjects(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const userId: number = parseInt(req.params.userId);

      if (!userId) {
        response = {
          message: 'Id do usuário não informado!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const projects: ResponseI = await ProjectService.list(userId);

      if (!projects.success) {
        response = {
          message: projects.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.NOT_FOUND, response);
      }

      response = {
        message: 'Projetos encontrados!',
        success: true,
        data: projects.data,
      };
      return ResponseValidator.response(req, res, HttpStatus.OK, response);
    } catch (err) {
      console.log(err);
      const response: ResponseI = {
        message: `Erro: ${err}`,
        success: false,
      };
      return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
    }
  }

  public async getProject(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const projectId: number = parseInt(req.params.projectId);
      const userId: number = parseInt(req.params.userId);

      if (!projectId) {
        response = {
          message: 'Id do projeto não informado!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      if (!userId) {
        response = {
          message: 'Id do usuário não informado!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const project: ResponseI = await ProjectService.get(projectId, userId);

      if (!project.success) {
        response = {
          message: project.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.NOT_FOUND, response);
      }

      response = {
        message: 'Projeto encontrado!',
        success: true,
        data: project.data,
      };
      return ResponseValidator.response(req, res, HttpStatus.OK, response);
    } catch (err) {
      console.log(err);
      const response: ResponseI = {
        message: `Erro: ${err}`,
        success: false,
      };
      return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
    }
  }

  public async addUserOnProject(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const userId: number = parseInt(req.params.userId);
      const projectId: number = parseInt(req.params.projectId);
      const projectMember: ProjectParticipationI = req.body;

      if (!projectId) {
        response = {
          message: 'Id do projeto não informado!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const hasPermission: boolean = await verifyPermission(projectId, userId, RolesEnum.MANAGER);

      if (!hasPermission) {
        response = {
          message: 'Você não tem permissão para adicionar membros a este projeto.',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.UNAUTHORIZED, response);
      }

      if (!projectMember) {
        response = {
          message: 'Membro do projeto não informado!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const userRole = await UserService.getProjectRole(userId, projectId);
      const participationRole = await UserService.getProjectRole(projectMember.userId, projectId);

      if (projectMember.role <= userRole.data || participationRole.data <= userRole.data) {
        response = {
          message: 'Você não pode atribuir uma função superior ou igual à sua.',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.UNAUTHORIZED, response);
      }

      const addMemberResponse: ResponseI = await ProjectService.addUserOnProject(projectId, projectMember);
      if (!addMemberResponse.success) {
        response = {
          message: `Erro ao adicionar membro ${projectMember.id}: ${addMemberResponse.message}`,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      response = {
        message: 'Membros adicionados ao projeto com sucesso!',
        success: true,
      };
      return ResponseValidator.response(req, res, HttpStatus.OK, response);
    } catch (err) {
      console.log(err);
      const response: ResponseI = {
        message: `Erro: ${err}`,
        success: false,
      };
      return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
    }
  }

  public async updateUserOnProject(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const userId: number = parseInt(req.params.userId);
      const projectId: number = parseInt(req.params.projectId);
      const projectMember: ProjectParticipationI = req.body;

      if (!projectId) {
        response = {
          message: 'Id do projeto não informado!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const hasPermission: boolean = await verifyPermission(projectId, userId, RolesEnum.MANAGER);

      if (!hasPermission) {
        response = {
          message: 'Você não tem permissão para atualizar membros deste projeto.',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.UNAUTHORIZED, response);
      }

      if (!projectMember || !projectMember.userId || typeof projectMember.role !== 'number') {
        response = {
          message: 'Dados do membro do projeto incompletos!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      if (projectMember.userId === userId) {
        response = {
          message: 'Você não pode alterar sua própria função.',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const userRole = await UserService.getProjectRole(userId, projectId);
      const participationRole = await UserService.getProjectRole(projectMember.userId, projectId);

      if (!userRole.data || !participationRole.data) {
        response = {
          message: 'Não foi possível verificar as funções dos usuários no projeto.',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      if (projectMember.role <= userRole.data || participationRole.data <= userRole.data) {
        response = {
          message: 'Você não pode atribuir uma função superior ou igual à sua.',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.UNAUTHORIZED, response);
      }

      const updateMemberResponse: ResponseI = await ProjectService.updateUserOnProject(projectId, projectMember);
      if (!updateMemberResponse.success) {
        response = {
          message: `Erro ao atualizar membro ${projectMember.userId}: ${updateMemberResponse.message}`,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      response = {
        message: 'Membro do projeto atualizado com sucesso!',
        success: true,
        data: updateMemberResponse.data,
      };
      return ResponseValidator.response(req, res, HttpStatus.OK, response);
    } catch (err) {
      console.log(err);
      const response: ResponseI = {
        message: `Erro: ${err}`,
        success: false,
      };
      return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
    }
  }

  public async removeUserFromProject(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const userId: number = parseInt(req.params.userId);
      const projectId: number = parseInt(req.params.projectId);
      const participationId: number = parseInt(req.params.participationId);

      if (!projectId || !participationId) {
        response = {
          message: 'Dados incompletos para remover membro do projeto.',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const hasPermission: boolean = await verifyPermission(projectId, userId, RolesEnum.MANAGER);

      if (!hasPermission) {
        response = {
          message: 'Você não tem permissão para remover membros deste projeto.',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.UNAUTHORIZED, response);
      }

      const removeMemberResponse: ResponseI = await ProjectService.removeUserFromProject(projectId, participationId);

      if (!removeMemberResponse.success) {
        response = {
          message: removeMemberResponse.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      response = {
        message: 'Membro removido do projeto com sucesso!',
        success: true,
      };
      return ResponseValidator.response(req, res, HttpStatus.OK, response);
    } catch (err) {
      console.log(err);
      const response: ResponseI = {
        message: `Erro: ${err}`,
        success: false,
      };
      return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
    }
  }

  public async listMembers(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const projectId: number = parseInt(req.params.projectId);

      if (!projectId) {
        response = {
          message: 'Id do projeto não informado!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const members: ResponseI = await ProjectService.listMembers(projectId);

      if (!members.success) {
        response = {
          message: members.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.NOT_FOUND, response);
      }

      response = {
        message: 'Membros encontrados!',
        success: true,
        data: members.data,
      };
      return ResponseValidator.response(req, res, HttpStatus.OK, response);
    } catch (err) {
      console.log(err);
      const response: ResponseI = {
        message: `Erro: ${err}`,
        success: false,
      };
      return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
    }
  }
}
