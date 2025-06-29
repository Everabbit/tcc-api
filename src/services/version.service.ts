import { ResponseI } from '../interfaces/response.interface';
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
}
