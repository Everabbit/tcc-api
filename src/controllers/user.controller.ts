import { Request, Response } from 'express';
import ResponseValidator from '../utils/reponse.utils';
import { HttpStatus } from '../enums/res_status.enum';
import { ResponseI } from '../interfaces/response.interface';
import { UserI } from '../models/user.model';
import UserService from '../services/user.service';
import { fromBase64, toBase64 } from '../utils/transform.utils';
import { PasswordChangeI } from '../interfaces/password.interface';
import EmailService from '../services/email.service';

export default class UserController {
  public async createEmailRequest(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const email: string = fromBase64(req.body.email);

      if (!email) {
        response = {
          message: 'Email não informado!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const emailRequest: ResponseI = await UserService.createEmailRequest(email);

      if (!emailRequest.success) {
        response = {
          message: emailRequest.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      EmailService.sendEmail(email, 'Confirmação de Email', 'email_confirmation', {
        hash: emailRequest.data.hash,
        baseRoute: process.env.FRONT_END_URL,
      });

      response = {
        message: 'Solicitação de email criada com sucesso!',
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
  public async acceptEmailRequest(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const hash: string = req.params.hash;

      if (!hash) {
        response = {
          message: 'Hash não informado!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const emailRequest: ResponseI = await UserService.acceptEmailRequest(hash);

      if (!emailRequest.success) {
        response = {
          message: emailRequest.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      response = {
        message: 'Solicitação de email aceita com sucesso!',
        success: true,
        data: emailRequest.data,
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

  public async createChangePasswordRequest(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const email: string = fromBase64(req.body.email);

      if (!email) {
        response = {
          message: 'Email não informado!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const changePasswordRequest: ResponseI = await UserService.createChangePasswordRequest(email);

      if (!changePasswordRequest.success) {
        response = {
          message: changePasswordRequest.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      EmailService.sendEmail(email, 'Redefinição de Senha', 'password_reset', {
        hash: changePasswordRequest.data.hash,
        baseRoute: process.env.FRONT_END_URL,
      });

      response = {
        message: 'Solicitação de mudança de senha criada com sucesso!',
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

  public async changePassword(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const hash: string = req.params.hash;
      const newPasswordBase64: string = req.body.password;

      if (!hash || !newPasswordBase64) {
        response = {
          message: 'Hash ou nova senha não informados!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const newPassword = fromBase64(newPasswordBase64);

      const changePasswordResult: ResponseI = await UserService.changePassword(hash, newPassword);

      if (!changePasswordResult.success) {
        response = {
          message: changePasswordResult.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      response = {
        message: 'Senha alterada com sucesso!',
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

      if (newUser.data && newUser.data.email) {
        EmailService.sendEmail(newUser.data.email, 'Bem-vindo(a) ao TaskForge!', 'welcome', {
          fullName: newUser.data.fullName,
          baseRoute: process.env.FRONT_END_URL,
        });
      } else {
        console.error(
          'Usuário criado com sucesso, mas o email não foi retornado. Não é possível enviar o email de boas-vindas.',
          newUser.data
        );
      }

      const jwtToken: ResponseI = await UserService.signJwt(newUser.data);

      if (!jwtToken.success) {
        response = {
          message: jwtToken.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      res.cookie('refreshToken', jwtToken.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      response = {
        message: newUser.message,
        success: true,
        data: jwtToken.data,
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
      }

      res.cookie('refreshToken', jwtToken.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      response = {
        message: newUser.message,
        success: true,
        data: jwtToken.data,
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

  public async refreshToken(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        response = {
          message: 'Token de atualização não fornecido!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.UNAUTHORIZED, response);
      }

      const newTokens: ResponseI = await UserService.refreshToken(refreshToken);

      if (!newTokens.success) {
        response = {
          message: newTokens.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.FORBIDDEN, response);
      }

      res.cookie('refreshToken', newTokens.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      response = {
        message: 'Tokens atualizados com sucesso!',
        success: true,
        data: newTokens.data,
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

  public async logout(req: Request, res: Response) {
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

      const logoutResult: ResponseI = await UserService.logout(userId);

      if (!logoutResult.success) {
        response = {
          message: logoutResult.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.INTERNAL_SERVER_ERROR, response);
      }

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      response = {
        message: 'Logout realizado com sucesso!',
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

  public async getUserRole(req: Request, res: Response) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const userId: number = parseInt(req.params.userId);
      const projectId: number = parseInt(req.params.projectId);

      if (!userId || !projectId) {
        response = {
          message: 'Dados incompletos para buscar a função do usuário no projeto!',
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.BAD_REQUEST, response);
      }

      const role: ResponseI = await UserService.getProjectRole(userId, projectId);

      if (!role.success) {
        response = {
          message: role.message,
          success: false,
        };
        return ResponseValidator.response(req, res, HttpStatus.NOT_FOUND, response);
      }

      response = {
        message: 'Função do usuário no projeto encontrada!',
        success: true,
        data: role.data,
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
