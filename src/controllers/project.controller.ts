import { Request, Response } from 'express';
import { ResponseI } from '../interfaces/response.interface';
import ResponseValidator from '../utils/reponse.utils';
import { HttpStatus } from '../enums/res_status.enum';
import ProjectService from '../services/projects.service';
import { ProjectI } from '../models/project.model';
import { ProjectCreateI } from '../interfaces/project.interface';
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

      console.log(bannerUploadUrl);

      const newProject: ProjectI = {
        creatorId: userId,
        name: project.name,
        description: project.description,
        status: ProjectStatus.ACTIVE,
        banner: bannerUploadUrl,
        deadline: project.deadline ? new Date(project.deadline) : undefined,
        progress: 0,
      };

      console.log(newProject);

      const projectCreated: ResponseI = await ProjectService.create(newProject);

      if (!projectCreated.success) {
        response = {
          message: projectCreated.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
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
}
