import { Request, Response } from 'express';
import { ResponseI } from '../interfaces/response.interface';
import { VersionI } from '../models/version.model';
import ResponseValidator from '../utils/reponse.utils';
import { HttpStatus } from '../enums/res_status.enum';
import { VersionCreateI } from '../interfaces/version.interface';
import VersionService from '../services/version.service';

export default class VersionController {
  public async createVersion(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const userId: number = parseInt(req.params.userId);
      const version: VersionCreateI = JSON.parse(req.body.version);

      if (!userId) {
        response = {
          message: 'Id do usuário não informado!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const newVersion: VersionI = {
        name: version.name,
        description: version.description,
        status: version.status,
        startDate: version.startDate ? new Date(version.startDate) : undefined,
        endDate: version.endDate ? new Date(version.endDate) : undefined,
        projectId: version.projectId,
      };

      const versionCreated: ResponseI = await VersionService.create(newVersion, userId);

      if (!versionCreated.success) {
        response = {
          message: versionCreated.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      response = {
        message: 'Versão criada com sucesso!',
        success: true,
        data: versionCreated.data,
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

  public async updateVersion(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const versionId: number = parseInt(req.params.versionId);
      const version: VersionCreateI = JSON.parse(req.body.version);

      if (!versionId) {
        response = {
          message: 'Id da versão não informado!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const updatedVersion: VersionI = {
        id: versionId,
        name: version.name,
        description: version.description,
        status: version.status,
        startDate: version.startDate ? new Date(version.startDate) : new Date(),
        endDate: version.endDate ? new Date(version.endDate) : undefined,
        projectId: version.projectId,
      };

      const versionUpdated: ResponseI = await VersionService.update(updatedVersion);

      if (!versionUpdated.success) {
        response = {
          message: versionUpdated.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      response = {
        message: 'Versão atualizada com sucesso!',
        success: true,
        data: versionUpdated.data,
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

  public async removeVersion(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const versionId: number = parseInt(req.params.versionId);

      if (!versionId) {
        response = {
          message: 'Id da versão não informado!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const versionRemoved: ResponseI = await VersionService.delete(versionId);

      if (!versionRemoved.success) {
        response = {
          message: versionRemoved.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      response = {
        message: 'Versão removida com sucesso!',
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

  public async getAllVersions(req: Request, res: Response) {
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

      const versions: ResponseI = await VersionService.getAll(projectId);

      if (!versions.success) {
        response = {
          message: versions.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.NOT_FOUND, response);
      }

      response = {
        message: 'Versões encontradas!',
        success: true,
        data: versions.data,
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

  public async getOneVersion(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const projectId: number = parseInt(req.params.projectId);
      const versionId: number = parseInt(req.params.versionId);

      if (!projectId || !versionId) {
        response = {
          message: 'Id do projeto ou da versão não informado!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const version: ResponseI = await VersionService.get(projectId, versionId);

      if (!version.success) {
        response = {
          message: version.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.NOT_FOUND, response);
      }

      response = {
        message: 'Versão encontrada!',
        success: true,
        data: version.data,
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
