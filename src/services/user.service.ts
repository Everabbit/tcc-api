import { Op } from 'sequelize';
import { ResponseI } from '../interfaces/response.interface';
import { User, UserI } from '../models/user.model';
import { UserPreferences, UserPreferencesI } from '../models/user_preferences.model';
import { deleteFile, uploadFile } from '../utils/files.utils';
import { PasswordChangeI } from '../interfaces/password.interface';
import { Project } from '../models/project.model';
import { ProjectParticipation } from '../models/project_participation.model';
import { RolesEnum } from '../enums/roles.enum';
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function gerarHash(senha: string): Promise<string> {
  const saltRounds: number = Number(process.env.SALT);
  const hash: string = await bcrypt.hash(senha, saltRounds);
  return hash;
}

export default class UserService {
  public static async create(user: UserI): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };
      if (!user) {
        return (response = {
          message: 'Dados não informados!',
          success: false,
        });
      }

      const existingUsers: UserI[] = await User.findAll({
        where: {
          [Op.or]: [
            {
              email: user.email,
            },
            {
              username: user.username,
            },
          ],
        },
      });

      if (existingUsers.length > 0) {
        return (response = {
          message: 'Este email ou nome de usuário já foi cadastrado.',
          success: false,
        });
      }

      user.password = await gerarHash(user.password);

      const lastAccess: Date = new Date();

      const newUser: ResponseI = await User.create({
        email: user.email,
        password: user.password,
        fullName: user.fullName,
        username: user.username,
        lastAccess: lastAccess,
      })
        .then(e => {
          return (response = {
            message: 'Usuário adicionado com sucesso',
            success: true,
            data: e,
          });
        })
        .catch(e => {
          console.log(e);
          return (response = {
            message: 'Erro ao adicionar usuário, verifique o log',
            success: false,
          });
        });

      await UserPreferences.create({
        userId: newUser.data.id,
        theme: '#007bff',
      });

      return newUser;
    } catch (err) {
      let response: ResponseI = {
        message: '',
        success: false,
      };
      console.log(err);
      return (response = {
        message: 'Erro ao adicionar usuário, verifique o log',
        success: false,
      });
    }
  }

  public static async update(user: UserI): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!user || !user.id) {
        response = {
          message: 'Dados do usuário incompletos!',
          success: false,
        };
        return response;
      }

      const userExists = await User.findByPk(user.id);
      if (!userExists) {
        response = {
          message: 'Usuário não encontrado.',
          success: false,
        };
        return response;
      }

      if (user.password) {
        user.password = await gerarHash(user.password);
      }

      const [rowsAffected, [updatedUser]] = await User.update(
        {
          email: user.email || userExists.email,
          fullName: user.fullName || userExists.fullName,
          username: user.username || userExists.username,
        },
        { where: { id: user.id }, returning: true }
      );

      if (rowsAffected === 0) {
        response = {
          message: 'Nenhum usuário foi atualizado.',
          success: false,
        };
        return response;
      }

      response = {
        message: 'Usuário atualizado com sucesso.',
        success: true,
        data: updatedUser,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao atualizar usuário, consulte o Log.',
        success: false,
      };
      return response;
    }
  }

  public static async delete(userId: number): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!userId) {
        response = {
          message: 'Id do usuário não informado.',
          success: false,
        };
        return response;
      }

      const userExists = await User.findByPk(userId);
      if (!userExists) {
        response = {
          message: 'Usuário não encontrado.',
          success: false,
        };
        return response;
      }

      const deletedRows = await User.destroy({
        where: { id: userId },
      });

      if (deletedRows === 0) {
        response = {
          message: 'Nenhum usuário foi removido.',
          success: false,
        };
        return response;
      }

      response = {
        message: 'Usuário removido com sucesso.',
        success: true,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao remover usuário, consulte o Log.',
        success: false,
      };
      return response;
    }
  }

  public static async login(user: UserI): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };
      if (!user) {
        return (response = {
          message: 'Dados não informados!',
          success: false,
        });
      }

      const userExists: UserI | null = await User.findOne({
        where: {
          [Op.or]: [
            {
              email: user.email,
            },
            {
              username: user.email,
            },
          ],
        },
      });

      if (!userExists) {
        return (response = {
          message: 'Usuário não encontrado!',
          success: false,
        });
      }

      const verifyPassword = await bcrypt.compare(user.password, userExists.password);

      if (!verifyPassword) {
        return (response = {
          message: 'Senha incorreta.',
          success: false,
        });
      }

      const lastAccess: Date = new Date();

      const update: ResponseI = await User.update(
        {
          lastAccess: lastAccess,
        },
        { where: { email: userExists.email } }
      )
        .then(e => {
          return (response = {
            message: 'Login realizado com sucesso',
            success: true,
            data: e,
          });
        })
        .catch(e => {
          console.log(e);
          return (response = {
            message: 'Erro ao atualizar usuário, verifique o log',
            success: false,
          });
        });

      if (!update.success) {
        return update;
      }
      response = {
        message: 'Login realizado com sucesso',
        success: true,
        data: userExists,
      };
      return response;
    } catch (err) {
      let response: ResponseI = {
        message: '',
        success: false,
      };
      console.log(err);
      return (response = {
        message: 'Erro ao realizar login de usuário, verifique o log',
        success: false,
      });
    }
  }

  public static async logout(userId: number): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!userId) {
        response = {
          message: 'Id do usuário não informado.',
          success: false,
        };
        return response;
      }

      const userExists = await User.findByPk(userId);
      if (!userExists) {
        response = {
          message: 'Usuário não encontrado.',
          success: false,
        };
        return response;
      }

      await userExists.update({ refreshToken: null });

      response = {
        message: 'Logout realizado com sucesso.',
        success: true,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao realizar logout, consulte o Log.',
        success: false,
      };
      return response;
    }
  }

  public static async signJwt(user: UserI): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!user) {
        return (response = {
          message: 'Dados não informados!',
          success: false,
        });
      }

      const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
      const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

      const accessToken: string = jwt.sign({ userId: user.id, email: user.email }, JWT_ACCESS_SECRET, {
        expiresIn: '2m',
      });

      const refreshToken: string = jwt.sign({ userId: user.id, email: user.email }, JWT_REFRESH_SECRET, {
        expiresIn: '7d',
      });

      const userExists: User | null = await User.findByPk(user.id);

      if (!userExists) {
        return (response = {
          message: 'Usuário não encontrado!',
          success: false,
        });
      }

      await userExists.update({ refreshToken: refreshToken });

      const token = {
        accessToken: accessToken,
        refreshToken: refreshToken,
      };

      response = {
        message: 'Token criado com sucesso!',
        success: true,
        data: token,
      };

      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao gerar token de usuário, consulte o Log.',
        success: false,
      };
      return response;
    }
  }
  public static async getJwtId(token: string): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };
      if (!token) {
        return (response = {
          message: 'Token não informado!',
          success: false,
        });
      }

      const JWT_SECRET: string | undefined = process.env.JWT_ACCESS_SECRET;

      if (!JWT_SECRET) {
        return (response = {
          message: 'Chave secreta não informada!',
          success: false,
        });
      }

      const decoded = jwt.decode(token, JWT_SECRET);

      if (!decoded) {
        return (response = {
          message: 'Token inválido!',
          success: false,
        });
      } else {
        return (response = {
          message: 'Token válido!',
          success: true,
          data: decoded.userId,
        });
      }
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao validar token de usuário, consulte o Log.',
        success: false,
      };
      return response;
    }
  }

  public static async refreshToken(refreshToken: string): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!refreshToken) {
        return (response = {
          message: 'Token de atualização não informado!',
          success: false,
        });
      }

      const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
      const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

      if (!JWT_REFRESH_SECRET || !JWT_ACCESS_SECRET) {
        return (response = {
          message: 'Chaves secretas não encontradas!',
          success: false,
        });
      }

      const decoded: any = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

      const userExists: User | null = await User.findByPk(decoded.userId);

      if (!userExists || userExists.refreshToken !== refreshToken) {
        return (response = {
          message: 'Token de atualização inválido!',
          success: false,
        });
      }

      const newAccessToken: string = jwt.sign({ userId: userExists.id, email: userExists.email }, JWT_ACCESS_SECRET, {
        expiresIn: '2m',
      });

      const newRefreshToken: string = jwt.sign({ userId: userExists.id, email: userExists.email }, JWT_REFRESH_SECRET, {
        expiresIn: '7d',
      });

      await userExists.update({ refreshToken: newRefreshToken });

      const token = {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };

      response = {
        message: 'Tokens atualizados com sucesso!',
        success: true,
        data: token,
      };

      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao atualizar token de usuário, consulte o Log.',
        success: false,
      };
      return response;
    }
  }

  public static async updatePassword(userId: number, password: PasswordChangeI): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!userId || !password) {
        response = {
          message: 'Dados incompletos para atualizar a senha!',
          success: false,
        };
        return response;
      }

      const userExists = await User.findByPk(userId);
      if (!userExists) {
        response = {
          message: 'Usuário não encontrado.',
          success: false,
        };
        return response;
      }

      const verifyPassword = await bcrypt.compare(password.currentPassword, userExists.password);

      if (!verifyPassword) {
        response = {
          message: 'Senha atual incorreta.',
          success: false,
        };
        return response;
      }

      if (password.newPassword !== password.newPasswordConfirm) {
        response = {
          message: 'Nova senha e confirmação de senha não coincidem.',
          success: false,
        };
        return response;
      }

      const newHashedPassword = await gerarHash(password.newPassword);

      const [rowsAffected, [updatedUser]] = await User.update(
        {
          password: newHashedPassword,
        },
        { where: { id: userId }, returning: true }
      );

      if (rowsAffected === 0) {
        response = {
          message: 'Nenhuma senha foi atualizada.',
          success: false,
        };
        return response;
      }

      response = {
        message: 'Senha atualizada com sucesso.',
        success: true,
        data: updatedUser,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao atualizar senha, consulte o Log.',
        success: false,
      };
      return response;
    }
  }

  public static async getUserSettings(userId: number): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!userId) {
        return (response = {
          message: 'Id do usuário não informado!',
          success: false,
        });
      }
      const user: UserI | null = await User.findOne({
        where: { id: userId },
        attributes: ['id', 'fullName', 'email', 'username', 'image', 'lastAccess'],
        include: [
          {
            model: UserPreferences,
          },
        ],
      });

      if (!user) {
        return (response = {
          message: 'Usuário não encontrado!',
          success: false,
        });
      } else {
        return (response = {
          message: 'Usuário encontrado!',
          success: true,
          data: user,
        });
      }
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao buscar informações do usuário, consulte o Log.',
        success: false,
      };
      return response;
    }
  }

  public static async updateImage(userId: number, image: Express.Multer.File) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!userId || !image) {
        return (response = {
          message: 'Dados incompletos para atualizar a imagem!',
          success: false,
        });
      }

      const userExists: UserI | null = await User.findByPk(userId);

      if (!userExists) {
        return (response = {
          message: 'Usuário não encontrado!',
          success: false,
        });
      }

      const imageUrl = await uploadFile(image);

      const [rowsAffected, [updatedUser]] = await User.update(
        {
          image: imageUrl,
        },
        { where: { id: userId }, returning: true }
      );

      if (rowsAffected === 0) {
        return (response = {
          message: 'Nenhuma imagem foi atualizada.',
          success: false,
        });
      }

      response = {
        message: 'Imagem de perfil atualizada com sucesso.',
        success: true,
        data: updatedUser,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao atualizar imagem de perfil, consulte o Log.',
        success: false,
      };
      return response;
    }
  }

  public static async removeImage(userId: number) {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!userId) {
        return (response = {
          message: 'Id do usuário não informado!',
          success: false,
        });
      }

      const userExists: UserI | null = await User.findByPk(userId);

      if (!userExists) {
        return (response = {
          message: 'Usuário não encontrado!',
          success: false,
        });
      }

      if (!userExists.image) {
        return (response = {
          message: 'Nenhuma imagem foi encontrada.',
          success: false,
        });
      }

      const tryDeleteFile = await deleteFile(userExists.image);

      if (!tryDeleteFile) {
        return (response = {
          message: 'Erro ao remover imagem do sistema de arquivos.',
          success: false,
        });
      }

      const [rowsAffected, [updatedUser]] = await User.update(
        {
          image: null,
        },
        { where: { id: userId }, returning: true }
      );

      if (rowsAffected === 0) {
        return (response = {
          message: 'Nenhuma imagem foi removida.',
          success: false,
        });
      }

      response = {
        message: 'Imagem de perfil removida com sucesso.',
        success: true,
        data: updatedUser,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao remover imagem de perfil, consulte o Log.',
        success: false,
      };
      return response;
    }
  }

  public static async getBasicUserInfo(userId: number): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!userId) {
        return (response = {
          message: 'Id do usuário não informado!',
          success: false,
        });
      }
      const user: UserI | null = await User.findOne({
        where: { id: userId },
        attributes: ['id', 'fullName', 'email', 'username', 'image'],
        include: [
          {
            model: UserPreferences,
          },
        ],
      });

      if (!user) {
        return (response = {
          message: 'Usuário não encontrado!',
          success: false,
        });
      } else {
        const userNameSplits: string[] = user.fullName.split(' ');
        user.fullName = userNameSplits[0] + ' ' + userNameSplits[userNameSplits.length - 1];
        return (response = {
          message: 'Usuário encontrado!',
          success: true,
          data: user,
        });
      }
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao buscar informações do usuário, consulte o Log.',
        success: false,
      };
      return response;
    }
  }

  public static async getUsersBasicList(username: string): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const users: UserI[] = await User.findAll({
        where: {
          username: {
            [Op.iLike]: `%${username}%`,
          },
        },
        attributes: ['id', 'username', 'image'],
        order: [['username', 'ASC']],
        limit: 5,
      });

      if (!users) {
        return (response = {
          message: 'Usuário não encontrado!',
          success: false,
        });
      } else {
        return (response = {
          message: 'Usuário encontrado!',
          success: true,
          data: users,
        });
      }
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao buscar usuários, consulte o Log.',
        success: false,
      };
      return response;
    }
  }

  public static async updatePreferences(userPreferences: UserPreferencesI): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!userPreferences || !userPreferences.userId) {
        response = {
          message: 'Dados de preferência do usuário incompletos!',
          success: false,
        };
        return response;
      }

      const preferencesExists = await UserPreferences.findOne({ where: { userId: userPreferences.userId } });

      if (!preferencesExists) {
        response = {
          message: 'Preferências do usuário não encontradas.',
          success: false,
        };
        return response;
      }

      const [rowsAffected, [updatedPreferences]] = await UserPreferences.update(
        {
          theme: userPreferences.theme || preferencesExists.theme,
          darkMode: userPreferences.darkMode !== undefined ? userPreferences.darkMode : preferencesExists.darkMode,
        },
        { where: { userId: userPreferences.userId }, returning: true }
      );

      if (rowsAffected === 0) {
        response = {
          message: 'Nenhuma preferência foi atualizada.',
          success: false,
        };
        return response;
      }

      response = {
        message: 'Preferências do usuário atualizadas com sucesso.',
        success: true,
        data: updatedPreferences,
      };
      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao atualizar preferências do usuário, consulte o Log.',
        success: false,
      };
      return response;
    }
  }

  public static async getPreferences(userId: number): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!userId) {
        return (response = {
          message: 'Id do usuário não informado!',
          success: false,
        });
      }

      const preferences: UserPreferencesI | null = await UserPreferences.findOne({
        where: { userId: userId },
      });

      if (!preferences) {
        return (response = {
          message: 'Preferências do usuário não encontradas!',
          success: false,
        });
      } else {
        return (response = {
          message: 'Preferências do usuário encontradas!',
          success: true,
          data: preferences,
        });
      }
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao buscar preferências do usuário, consulte o Log.',
        success: false,
      };
      return response;
    }
  }

  public static async getProjectRole(userId: number, projectId: number): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      if (!userId || !projectId) {
        return (response = {
          message: 'Dados incompletos para buscar a função do usuário no projeto!',
          success: false,
        });
      }

      const project = await Project.findByPk(projectId);

      if (!project) {
        return (response = {
          message: 'Projeto não encontrado!',
          success: false,
        });
      }

      if (project.creatorId === userId) {
        return (response = {
          message: 'Usuário é o criador do projeto!',
          success: true,
          data: RolesEnum.ADMIN,
        });
      }

      const participation = await ProjectParticipation.findOne({
        where: { userId: userId, projectId: projectId },
      });

      if (participation) {
        return (response = {
          message: 'Usuário é membro do projeto!',
          success: true,
          data: participation.role,
        });
      }

      return (response = {
        message: 'Usuário não tem função neste projeto!',
        success: false,
      });
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao buscar função do usuário no projeto, consulte o Log.',
        success: false,
      };
      return response;
    }
  }
}
