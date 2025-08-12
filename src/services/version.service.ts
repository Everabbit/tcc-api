import { ResponseI } from '../interfaces/response.interface';
import { Task } from '../models/task.models';
import { Version, VersionI } from '../models/version.model';

export default class VersionService {
  public static async create(version: VersionI, userId: number): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };
      if (!version || !version.name) {
        response = {
          message: 'Versão inválida, verifique os dados.',
          success: false,
        };
        return response;
      }

      const projectExists = await Version.findOne({ where: { name: version.name, projectId: version.projectId } });
      if (projectExists) {
        response = {
          message: 'Já existe uma versão com este nome.',
          success: false,
        };
        return response;
      }

      const newVersion = await Version.create({
        projectId: version.projectId,
        name: version.name,
        description: version.description,
        status: version.status,
        startDate: version.startDate,
        endDate: version.endDate,
      });
      if (!newVersion) {
        response = {
          message: 'Erro ao criar versão, consulte o Log.',
          success: false,
        };
        return response;
      }
      response = {
        message: 'Versão criada com sucesso.',
        success: true,
        data: newVersion,
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

  public static async update(version: VersionI): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!version || !version.id) {
        response = {
          message: 'Versão inválida, verifique os dados.',
          success: false,
        };
        return response;
      }

      const versionExists = await Version.findOne({ where: { id: version.id } });
      if (!versionExists) {
        response = {
          message: 'Versão não encontrada.',
          success: false,
        };
        return response;
      }

      const [rowsAffected, [updatedVersion]] = await Version.update(
        {
          name: version.name,
          description: version.description,
          status: version.status,
          startDate: version.startDate,
          endDate: version.endDate,
        },
        { where: { id: version.id }, returning: true }
      );

      if (rowsAffected === 0) {
        response = {
          message: 'Nenhuma versão foi atualizada.',
          success: false,
        };
        return response;
      }

      response = {
        message: 'Versão atualizada com sucesso.',
        success: true,
        data: updatedVersion,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao atualizar versão, consulte o Log.',
        success: false,
      };
      return response;
    }
  }

  public static async delete(versionId: number): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!versionId) {
        response = {
          message: 'Id da versão não informado.',
          success: false,
        };
        return response;
      }

      const versionExists = await Version.findOne({ where: { id: versionId } });
      if (!versionExists) {
        response = {
          message: 'Versão não encontrada.',
          success: false,
        };
        return response;
      }

      const deletedRows = await Version.destroy({
        where: { id: versionId },
      });

      if (deletedRows === 0) {
        response = {
          message: 'Nenhuma versão foi removida.',
          success: false,
        };
        return response;
      }

      response = {
        message: 'Versão removida com sucesso.',
        success: true,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao remover versão, consulte o Log.',
        success: false,
      };
      return response;
    }
  }

  public static async getAll(projectId: number): Promise<ResponseI> {
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

      const versions: VersionI[] = await Version.findAll({
        where: { projectId: projectId },
        include: [
          {
            model: Task,
            attributes: ['id', 'status'],
          },
        ],
      });

      if (!versions) {
        response = {
          message: 'Nenhuma versão encontrada.',
          success: false,
        };
        return response;
      }

      response = {
        message: 'Versões encontradas com sucesso.',
        success: true,
        data: versions,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao buscar versões, consulte o Log.',
        success: false,
      };
      return response;
    }
  }

  public static async get(versionId: number): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!versionId) {
        response = {
          message: 'Id do projeto ou da versão não informado.',
          success: false,
        };
        return response;
      }

      const version: VersionI | null = await Version.findOne({
        where: { id: versionId },
      });

      if (!version) {
        response = {
          message: 'Versão não encontrada.',
          success: false,
        };
        return response;
      }

      response = {
        message: 'Versão encontrada com sucesso.',
        success: true,
        data: version,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao buscar versão, consulte o Log.',
        success: false,
      };
      return response;
    }
  }
}
