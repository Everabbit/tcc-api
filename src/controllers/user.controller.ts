import { Request, Response } from 'express';
import ResponseValidator from '../utils/reponse.utils';
import { HttpStatus } from '../Enums/res_status.enum';
import { ResponseI } from '../models/response.model';
import { UserI } from '../models/user.model';
import UserService from '../services/user.service';

export default class UserController {
  public async create(req: Request, res: Response) {
    try {
      const user: UserI = req.body;
      const response: ResponseI = {};

      if (!user || !user.email || !user.password || !user.name) {
        response.message = 'Informações incompletas!';
        ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
        return;
      }

      const sucess: string = await UserService.create(user);

      if (sucess !== 'Sucesso') {
        response.message = sucess;
        ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
        return;
      }

      response.message = 'Usuário adicionado com sucesso!';
      ResponseValidator.response(req, res, HttpStatus.OK, response);
    } catch (err) {
      console.log(err);
      const response: ResponseI = {
        message: `Erro: ${err}`,
      };
      ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
    }
  }
}
