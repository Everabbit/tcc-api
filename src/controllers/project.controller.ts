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
        sucess: false,
      };

      const userId: number = parseInt(req.params.userId);
      const project: ProjectCreateI = req.body;

      if (!userId) {
        response = {
          message: 'Id do usuário não informado!',
          sucess: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }
      const newProject: ProjectI = {
        creatorId: userId,
        name: project.name,
        description: project.description,
        status: ProjectStatus.ACTIVE,
        banner: project.bannerFile ? project.bannerFile.name : undefined,
        deadline: project.deadline ? new Date(project.deadline) : undefined,
        progress: 0,
      };

      const projectCreated: ResponseI = await ProjectService.create(newProject);

      if (!projectCreated.sucess) {
        response = {
          message: projectCreated.message,
          sucess: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      response = {
        message: 'Projeto criado com sucesso!',
        sucess: true,
        data: projectCreated.data,
      };
      return ResponseValidator.response(req, res, HttpStatus.OK, response);
    } catch (err) {
      console.log(err);
      const response: ResponseI = {
        message: `Erro: ${err}`,
        sucess: false,
      };
      return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
    }
  }
}
