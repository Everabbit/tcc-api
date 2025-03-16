import { Request, Response } from 'express';
import ResponseValidator from '../utils/reponse.utils';
import { HttpStatus } from '../enums/res_status.enum';
import { ResponseI } from '../models/response.model';
import { UserI } from '../models/user.model';
import UserService from '../services/user.service';

export default class UserController {
  public async create(req: Request, res: Response) {
    try {
      const user: UserI = req.body;
      let response: ResponseI = {};

      if (!user || !user.email || !user.password || !user.name) {
        response = {
          message: 'Informações incompletas!',
          data: '',
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const newUser: ResponseI = await UserService.create(user);

      if (!newUser.data) {
        response = {
          message: newUser.message,
          data: '',
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      response = newUser;
      return ResponseValidator.response(req, res, HttpStatus.OK, response);
    } catch (err) {
      console.log(err);
      const response: ResponseI = {
        message: `Erro: ${err}`,
        data: '',
      };
      return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
    }
  }
}
