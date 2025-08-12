import { Request, Response } from 'express';
import TagService from '../services/tag.service';
import { ResponseI } from '../interfaces/response.interface';
import ResponseValidator from '../utils/reponse.utils';
import { HttpStatus } from '../enums/res_status.enum';
import { verifyPermission } from '../utils/roles.utils';
import { TagI } from '../models/tag.model';
import { RolesEnum } from '../enums/roles.enum';

export default class TagController {
  public async createTag(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const userId: number = parseInt(req.params.userId);
      const tag: TagI = req.body;

      const hasPermission: boolean = await verifyPermission(tag.projectId, userId, RolesEnum.DEVELOPER);

      if (!hasPermission) {
        response = {
          message: 'Você não tem permissão para criar uma tag neste projeto.',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.UNAUTHORIZED, response);
      }

      if (!tag || !tag.name || !tag.projectId) {
        response = {
          message: 'Dados incompletos para criar tag.',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const tagCreated: ResponseI = await TagService.create(tag);

      if (!tagCreated.success) {
        response = {
          message: tagCreated.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      response = {
        message: 'Tag criada com sucesso!',
        success: true,
        data: tagCreated.data,
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

  public async updateTag(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const userId: number = parseInt(req.params.userId);
      const tag = req.body;

      const hasPermission: boolean = await verifyPermission(tag.projectId, userId, RolesEnum.DEVELOPER);

      if (!hasPermission) {
        response = {
          message: 'Você não tem permissão para atualizar esta tag neste projeto.',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.UNAUTHORIZED, response);
      }

      if (!tag || !tag.id) {
        response = {
          message: 'Dados incompletos para atualizar tag.',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const tagUpdated: ResponseI = await TagService.update(tag);

      if (!tagUpdated.success) {
        response = {
          message: tagUpdated.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      response = {
        message: 'Tag atualizada com sucesso!',
        success: true,
        data: tagUpdated.data,
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

  public async deleteTag(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const userId: number = parseInt(req.params.userId);
      const tagId: number = parseInt(req.params.tagId);
      const projectId: number = parseInt(req.params.projectId);

      const hasPermission: boolean = await verifyPermission(projectId, userId, RolesEnum.DEVELOPER);

      if (!hasPermission) {
        response = {
          message: 'Você não tem permissão para remover esta tag deste projeto.',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.UNAUTHORIZED, response);
      }

      if (!tagId) {
        response = {
          message: 'Id da tag não informado!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const tagDeleted: ResponseI = await TagService.delete(tagId);

      if (!tagDeleted.success) {
        response = {
          message: tagDeleted.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      response = {
        message: 'Tag removida com sucesso!',
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
  public async getAllTags(req: Request, res: Response) {
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

      const tags: ResponseI = await TagService.getAll(projectId);

      if (!tags.success) {
        response = {
          message: tags.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.NOT_FOUND, response);
      }

      response = {
        message: 'Tags encontradas!',
        success: true,
        data: tags.data,
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
