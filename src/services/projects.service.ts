import { UploadApiResponse } from 'cloudinary';
import { ResponseI } from '../interfaces/response.interface';
import { Project, ProjectI } from '../models/project.model';
import { cloudinary } from '../configs/cloudinary';
import { v4 as uuidv4 } from 'uuid';
import streamifier from 'streamifier';
import { ProjectMemberI } from '../interfaces/project.interface';
import { ProjectParticipation, ProjectParticipationI } from '../models/project_participation.model';
import { ProjectStatus } from '../enums/project_status.enum';
import { User } from '../models/user.model';
import { Version } from '../models/version.model';

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

      const project: ProjectI | null = await Project.findOne({
        where: { id: projectId },
        include: [
          {
            model: ProjectParticipation,
            include: [
              {
                model: User,
                attributes: ['id', 'fullName', 'username', 'image'],
              },
            ],
          },
          {
            model: Version,
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

      const projects: ProjectI[] = await Project.findAll({
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
        ],
      });

      if (!projects) {
        response = {
          message: 'Nenhum projeto encontrado.',
          success: false,
        };
        return response;
      }

      //verificar se usuário é criador ou participante, se não remover o projeto
      const filteredProjects = projects.filter(project => {
        const isCreator = project.creatorId === userId;
        const isParticipant = project.participation?.some(
          (participation: ProjectParticipationI) => participation.userId === userId
        );
        return isCreator || isParticipant;
      });

      if (filteredProjects.length === 0) {
        response = {
          message: 'Nenhum projeto encontrado para este usuário.',
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
