import { Request, Response } from 'express';
import ResponseValidator from '../utils/reponse.utils';
import { HttpStatus } from '../enums/res_status.enum';
import { ResponseI } from '../interfaces/response.interface';
import { UserI } from '../models/user.model';
import UserService from '../services/user.service';
import { fromBase64 } from '../utils/transform.utils';

export default class UserController {
  public async register(req: Request, res: Response) {
    try {
      const user: UserI = req.body;
      let response: ResponseI = {
        message: '',
        sucess: false,
      };

      user.email = fromBase64(user.email);
      user.password = fromBase64(user.password);
      user.fullName = fromBase64(user.fullName);

      if (!user || !user.email || !user.password || !user.fullName) {
        response = {
          message: 'Informações incompletas!',
          sucess: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const newUser: ResponseI = await UserService.create(user);

      if (!newUser.sucess) {
        response = {
          message: newUser.message,
          sucess: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      const jwtToken: ResponseI = await UserService.signJwt(newUser.data);

      if (!jwtToken.sucess) {
        response = {
          message: jwtToken.message,
          sucess: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      } else {
        response = {
          message: newUser.message,
          sucess: true,
          data: jwtToken.data,
        };
      }

      return ResponseValidator.response(req, res, HttpStatus.OK, response);
    } catch (err) {
      console.log(err);
      const response: ResponseI = {
        message: `Erro: ${err}`,
        sucess: false,
      };
      return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
    }
  }

  public async login(req: Request, res: Response) {
    try {
      const user: UserI = req.body;
      let response: ResponseI = {
        message: '',
        sucess: false,
      };

      if (!user || !user.email || !user.password) {
        response = {
          message: 'Informações incompletas!',
          sucess: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const newUser: ResponseI = await UserService.login(user);

      if (!newUser.sucess) {
        response = {
          message: newUser.message,
          sucess: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      const jwtToken: ResponseI = await UserService.signJwt(newUser.data);

      if (!jwtToken.sucess) {
        response = {
          message: jwtToken.message,
          sucess: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      } else {
        response = {
          message: newUser.message,
          sucess: true,
          data: jwtToken.data,
        };
      }

      return ResponseValidator.response(req, res, HttpStatus.OK, response);
    } catch (err) {
      console.log(err);
      const response: ResponseI = {
        message: `Erro: ${err}`,
        sucess: false,
      };
      return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
    }
  }
  public async validateToken(req: Request, res: Response) {
    try {
      const token: string = req.headers.authorization?.toString() || '';
      console.log(token);
      let response: ResponseI = {
        message: '',
        sucess: false,
      };

      const validateJwt: ResponseI = await UserService.verifyJwt(token);

      if (!validateJwt.sucess) {
        response = {
          message: validateJwt.message,
          sucess: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.UNAUTHORIZED, response);
      }

      response = {
        message: 'Token válido!',
        sucess: true,
      };
      return ResponseValidator.response(req, res, HttpStatus.OK, response);
    } catch (err) {
      console.log(err);
      const response: ResponseI = {
        message: `Erro: ${err}`,
        sucess: false,
        data: false,
      };
      return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
    }
  }
}
