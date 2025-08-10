import { Request, Response } from 'express';
import ResponseValidator from '../utils/reponse.utils';
import { HttpStatus } from '../enums/res_status.enum';
import { ResponseI } from '../interfaces/response.interface';
import { UserI } from '../models/user.model';
import UserService from '../services/user.service';
import { fromBase64 } from '../utils/transform.utils';
import { PasswordChangeI } from '../interfaces/password.interface';

export default class UserController {
  public async register(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const user: UserI = req.body;

      user.email = fromBase64(user.email);
      user.password = fromBase64(user.password);
      user.fullName = fromBase64(user.fullName);
      if (user.username) user.username = fromBase64(user.username);

      if (!user || !user.email || !user.password || !user.fullName || !user.username) {
        response = {
          message: 'Informações incompletas!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const newUser: ResponseI = await UserService.create(user);

      if (!newUser.success) {
        response = {
          message: newUser.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      const jwtToken: ResponseI = await UserService.signJwt(newUser.data);

      if (!jwtToken.success) {
        response = {
          message: jwtToken.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      } else {
        response = {
          message: newUser.message,
          success: true,
          data: jwtToken.data,
        };
      }

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

  public async login(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const user: UserI = req.body;

      if (!user || !user.email || !user.password) {
        response = {
          message: 'Informações incompletas!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      user.email = fromBase64(user.email);
      user.password = fromBase64(user.password);

      const newUser: ResponseI = await UserService.login(user);

      if (!newUser.success) {
        response = {
          message: newUser.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.OK, response);
      }

      const jwtToken: ResponseI = await UserService.signJwt(newUser.data);

      if (!jwtToken.success) {
        response = {
          message: jwtToken.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      } else {
        response = {
          message: newUser.message,
          success: true,
          data: jwtToken.data,
        };
      }

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
  public async validateToken(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const authHeader: string | undefined = req.headers.authorization;
      let jwtToken: string | undefined;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        jwtToken = authHeader.substring(7);
      }

      if (!jwtToken) {
        response = {
          message: 'Token não fornecido ou malformado.',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.UNAUTHORIZED, response);
      }
      const validateJwt: ResponseI = await UserService.verifyJwt(jwtToken);

      if (!validateJwt.success) {
        response = {
          message: validateJwt.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.UNAUTHORIZED, response);
      }

      response = {
        message: 'Token válido!',
        success: true,
      };
      return ResponseValidator.response(req, res, HttpStatus.OK, response);
    } catch (err) {
      console.log(err);
      const response: ResponseI = {
        message: `Erro: ${err}`,
        success: false,
        data: false,
      };
      return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
    }
  }

  public async updateUser(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const userId: number = parseInt(req.params.userId);
      const user: UserI = req.body;

      if (!userId) {
        response = {
          message: 'Id do usuário não informado!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      if (!user) {
        response = {
          message: 'Dados do usuário não informados!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      user.id = userId;
      if (user.email) user.email = fromBase64(user.email);
      if (user.fullName) user.fullName = fromBase64(user.fullName);
      if (user.username) user.username = fromBase64(user.username);

      const updatedUser: ResponseI = await UserService.update(user);

      if (!updatedUser.success) {
        response = {
          message: updatedUser.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      response = {
        message: 'Usuário atualizado com sucesso!',
        success: true,
        data: updatedUser.data,
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

  public async deleteUser(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const userId: number = parseInt(req.params.userId);

      if (!userId) {
        response = {
          message: 'Id do usuário não informado!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const userDeleted: ResponseI = await UserService.delete(userId);

      if (!userDeleted.success) {
        response = {
          message: userDeleted.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      response = {
        message: 'Usuário removido com sucesso!',
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

  public async updatePassword(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const userId: number = parseInt(req.params.userId);
      const passwordData: PasswordChangeI = req.body.password;

      if (!userId) {
        response = {
          message: 'Id do usuário não informado!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      if (
        !passwordData ||
        !passwordData.currentPassword ||
        !passwordData.newPassword ||
        !passwordData.newPasswordConfirm
      ) {
        response = {
          message: 'Dados de senha incompletos!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      passwordData.currentPassword = fromBase64(passwordData.currentPassword);
      passwordData.newPassword = fromBase64(passwordData.newPassword);
      passwordData.newPasswordConfirm = fromBase64(passwordData.newPasswordConfirm);

      const updatedPassword: ResponseI = await UserService.updatePassword(userId, passwordData);

      if (!updatedPassword.success) {
        response = {
          message: updatedPassword.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.OK, response);
      }

      response = {
        message: 'Senha atualizada com sucesso!',
        success: true,
        data: updatedPassword.data,
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

  public async getUserSettings(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const userId: number = parseInt(req.params.userId);

      if (!userId) {
        response = {
          message: 'Id do usuário não informado!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const user: ResponseI = await UserService.getUserSettings(userId);

      if (!user.success) {
        response = {
          message: user.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.NOT_FOUND, response);
      }

      response = {
        message: 'Usuário encontrado!',
        success: true,
        data: user.data,
      };
      return ResponseValidator.response(req, res, HttpStatus.OK, response);
    } catch (err) {
      console.log(err);
      const response: ResponseI = {
        message: `Erro: ${err}`,
        success: false,
        data: false,
      };
      return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
    }
  }

  public async updateImage(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const userId: number = parseInt(req.params.userId);
      const image: Express.Multer.File | undefined = req.file;

      if (!userId) {
        response = {
          message: 'Id do usuário não informado!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      if (!image) {
        response = {
          message: 'Imagem não fornecida!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const updatedUser: ResponseI = await UserService.updateImage(userId, image);

      if (!updatedUser.success) {
        response = {
          message: updatedUser.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      response = {
        message: 'Imagem de perfil atualizada com sucesso!',
        success: true,
        data: updatedUser.data,
      };
      return ResponseValidator.response(req, res, HttpStatus.OK, response);
    } catch (err) {
      console.log(err);
      const response: ResponseI = {
        message: `Erro: ${err}`,
        success: false,
        data: false,
      };
      return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
    }
  }

  public async removeImage(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const userId: number = parseInt(req.params.userId);

      if (!userId) {
        response = {
          message: 'Id do usuário não informado!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const updatedUser: ResponseI = await UserService.removeImage(userId);

      if (!updatedUser.success) {
        response = {
          message: updatedUser.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      response = {
        message: 'Imagem de perfil removida com sucesso!',
        success: true,
        data: updatedUser.data,
      };
      return ResponseValidator.response(req, res, HttpStatus.OK, response);
    } catch (err) {
      console.log(err);
      const response: ResponseI = {
        message: `Erro: ${err}`,
        success: false,
        data: false,
      };
      return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
    }
  }

  public async getBasicInfoUser(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const userId: number = parseInt(req.params.userId);

      if (!userId) {
        response = {
          message: 'Id do usuário não informado!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const user: ResponseI = await UserService.getBasicUserInfo(userId);

      if (!user.success) {
        response = {
          message: user.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.NOT_FOUND, response);
      }

      response = {
        message: 'Usuário encontrado!',
        success: true,
        data: user.data,
      };
      return ResponseValidator.response(req, res, HttpStatus.OK, response);
    } catch (err) {
      console.log(err);
      const response: ResponseI = {
        message: `Erro: ${err}`,
        success: false,
        data: false,
      };
      return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
    }
  }

  public async getBasicUserList(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      let username: string = req.params.username;

      if (!username) {
        response = {
          message: 'Nome de usuário não informado!',
          success: false,
        };
      }

      username = fromBase64(username);

      const user: ResponseI = await UserService.getUsersBasicList(username);

      if (!user.success) {
        response = {
          message: user.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.NOT_FOUND, response);
      }

      response = {
        message: 'Usuário encontrado!',
        success: true,
        data: user.data,
      };
      return ResponseValidator.response(req, res, HttpStatus.OK, response);
    } catch (err) {
      console.log(err);
      const response: ResponseI = {
        message: `Erro: ${err}`,
        success: false,
        data: false,
      };
      return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
    }
  }

  public async updatePreferences(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const userId: number = parseInt(req.params.userId);
      const userPreferences = req.body;

      if (!userId) {
        response = {
          message: 'Id do usuário não informado!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      if (!userPreferences) {
        response = {
          message: 'Dados de preferência não informados!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      userPreferences.userId = userId;

      const updatedPreferences: ResponseI = await UserService.updatePreferences(userPreferences);

      if (!updatedPreferences.success) {
        response = {
          message: updatedPreferences.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      response = {
        message: 'Preferências do usuário atualizadas com sucesso!',
        success: true,
        data: updatedPreferences.data,
      };
      return ResponseValidator.response(req, res, HttpStatus.OK, response);
    } catch (err) {
      console.log(err);
      const response: ResponseI = {
        message: `Erro: ${err}`,
        success: false,
        data: false,
      };
      return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
    }
  }

  public async getPreferences(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const userId: number = parseInt(req.params.userId);

      if (!userId) {
        response = {
          message: 'Id do usuário não informado!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const preferences: ResponseI = await UserService.getPreferences(userId);

      if (!preferences.success) {
        response = {
          message: preferences.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.NOT_FOUND, response);
      }

      response = {
        message: 'Preferências do usuário encontradas!',
        success: true,
        data: preferences.data,
      };
      return ResponseValidator.response(req, res, HttpStatus.OK, response);
    } catch (err) {
      console.log(err);
      const response: ResponseI = {
        message: `Erro: ${err}`,
        success: false,
        data: false,
      };
      return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
    }
  }
}
