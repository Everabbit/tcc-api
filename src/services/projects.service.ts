import { UploadApiResponse } from 'cloudinary';
import { ResponseI } from '../interfaces/response.interface';
import { Project, ProjectI } from '../models/project.model';
import { cloudinary } from '../configs/cloudinary';
import { v4 as uuidv4 } from 'uuid';
import streamifier from 'streamifier';

export default class ProjectService {
  //crud dos projetos
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

      const projectExists = await Project.findOne({ where: { name: project.name } });
      if (projectExists) {
        response = {
          message: 'Já existe um projeto com este nome.',
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
}
