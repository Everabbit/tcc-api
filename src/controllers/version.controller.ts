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
        startDate: version.startDate ? new Date(version.startDate) : new Date(),
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
}
