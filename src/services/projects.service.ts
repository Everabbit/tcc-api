import { UploadApiResponse } from 'cloudinary';
import { ResponseI } from '../interfaces/response.interface';
import { Project, ProjectI } from '../models/project.model';
import { cloudinary } from '../configs/cloudinary';
import { v4 as uuidv4 } from 'uuid';
import streamifier from 'streamifier';
import { ProjectMemberI } from '../interfaces/project.interface';
import { ProjectParticipation, ProjectParticipationI } from '../models/project_participation.model';
import { ProjectStatus } from '../enums/project_status.enum';

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
  public static async list(userId: number): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const projects: ProjectI[] = await Project.findAll({
        include: [
          {
            model: ProjectParticipation,
            where: { userId: userId },
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

      response = {
        message: 'Projetos encontrados com sucesso.',
        success: true,
        data: projects,
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

  public static async addUserOnProject(projectId: number, projectMember: ProjectMemberI): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!projectId || !projectMember || !projectMember.id || !projectMember.role) {
        response = {
          message: 'Dados incompletos para adicionar membro ao projeto.',
          success: false,
        };
        return response;
      }

      const userExists: ProjectParticipationI | null = await ProjectParticipation.findOne({
        where: { userId: projectMember.id, projectId },
      });

      if (userExists) {
        response = {
          message: 'Usuário já participa deste projeto.',
          success: false,
        };
        return response;
      }

      const newProjectMember: ProjectParticipationI | null = await ProjectParticipation.create({
        userId: projectMember.id,
        projectId: projectId,
        role: projectMember.role,
        invitedAt: new Date(),
      });

      if (!newProjectMember) {
        response = {
          message: 'Erro ao adicionar membro ao projeto, consulte o Log.',
          success: false,
        };
        return response;
      }

      response = {
        message: 'Membro adicionado ao projeto com sucesso.',
        success: true,
        data: newProjectMember,
      };

      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao adicionar usuário ao projeto, consulte o Log.',
        success: false,
      };
      return response;
    }
  }
}
