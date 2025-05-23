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

      user.email = fromBase64(user.email);
      user.password = fromBase64(user.password);

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
      let response: ResponseI = {
        message: '',
        sucess: false,
      };

      const authHeader: string | undefined = req.headers.authorization;
      let jwtToken: string | undefined;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        jwtToken = authHeader.substring(7);
      }

      if (!jwtToken) {
        response = {
          message: 'Token não fornecido ou malformado.',
          sucess: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.UNAUTHORIZED, response);
      }
      const validateJwt: ResponseI = await UserService.verifyJwt(jwtToken);

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
  public async getBasicInfoUser(req: Request, res: Response) {
    try {
      const userId: number = parseInt(req.params.userId);
      let response: ResponseI = {
        message: '',
        sucess: false,
      };
      if (!userId) {
        response = {
          message: 'Id do usuário não informado!',
          sucess: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const user: ResponseI = await UserService.getBasicUserInfo(userId);

      if (!user.sucess) {
        response = {
          message: user.message,
          sucess: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.NOT_FOUND, response);
      }

      response = {
        message: 'Usuário encontrado!',
        sucess: true,
        data: user.data,
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
