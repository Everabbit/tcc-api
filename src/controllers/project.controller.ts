import { Request, Response } from 'express';
import { ResponseI } from '../interfaces/response.interface';
import ResponseValidator from '../utils/reponse.utils';
import { HttpStatus } from '../enums/res_status.enum';
import ProjectService from '../services/projects.service';
import { ProjectI } from '../models/project.model';
import { ProjectCreateI, ProjectMemberI } from '../interfaces/project.interface';
import { ProjectStatus } from '../enums/project_status.enum';

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

      if (!userId) {
        response = {
          message: 'Id do usuário não informado!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      let bannerUploadUrl: string = '';

      if (banner) {
        bannerUploadUrl = banner.path;
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

      //adicionar usuário principal
      const admin: ProjectMemberI = {
        id: userId,
        role: 1,
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
}
