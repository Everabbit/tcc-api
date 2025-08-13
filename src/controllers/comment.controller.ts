import { Request, Response } from 'express';
import { ResponseI } from '../interfaces/response.interface';
import { CommentI } from '../models/comment.model';
import ResponseValidator from '../utils/reponse.utils';
import { HttpStatus } from '../enums/res_status.enum';
import CommentService from '../services/comment.service';

export default class CommentController {
  public async addComment(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const comment: CommentI = req.body;

      if (!comment || !comment.taskId || !comment.authorId || !comment.content) {
        response = {
          message: 'Dados incompletos para adicionar comentário.',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const commentAdded: ResponseI = await CommentService.create(comment);

      if (!commentAdded.success) {
        response = {
          message: commentAdded.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      response = {
        message: 'Comentário adicionado com sucesso!',
        success: true,
        data: commentAdded.data,
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

  public async removeComment(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const commentId: number = parseInt(req.params.commentId);

      if (!commentId) {
        response = {
          message: 'Id do comentário não informado!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const commentRemoved: ResponseI = await CommentService.delete(commentId);

      if (!commentRemoved.success) {
        response = {
          message: commentRemoved.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      response = {
        message: 'Comentário removido com sucesso!',
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

  public async updateComment(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const comment: CommentI = req.body;

      if (!comment || !comment.id || !comment.content) {
        response = {
          message: 'Dados incompletos para atualizar o comentário.',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const commentUpdated: ResponseI = await CommentService.update(comment);

      if (!commentUpdated.success) {
        response = {
          message: commentUpdated.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      response = {
        message: 'Comentário atualizado com sucesso!',
        success: true,
        data: commentUpdated.data,
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
