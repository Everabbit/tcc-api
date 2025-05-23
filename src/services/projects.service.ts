import { ResponseI } from '../interfaces/response.interface';
import { Project, ProjectI } from '../models/project.model';

export default class ProjectService {
  //crud dos projetos
  public static async create(project: ProjectI): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        sucess: false,
      };
      if (!project || !project.name) {
        response = {
          message: 'Projeto inválido, verifique os dados.',
          sucess: false,
        };
        return response;
      }

      const projectExists = await Project.findOne({ where: { name: project.name } });
      if (projectExists) {
        response = {
          message: 'Já existe um projeto com este nome.',
          sucess: false,
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
          sucess: false,
        };
        return response;
      }
      response = {
        message: 'Projeto criado com sucesso.',
        sucess: true,
        data: newProject,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao buscar informações do usuário, consulte o Log.',
        sucess: false,
      };
      return response;
    }
  }
}
