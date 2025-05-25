import { ResponseI } from '../interfaces/response.interface';
import { User, UserI } from '../models/user.model';
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

      const userExists: UserI[] = await User.findAll({ where: { email: user.email } });

      if (userExists.length > 0) {
        return (response = {
          message: 'Este email já foi cadastrado.',
          success: false,
        });
      }

      user.password = await gerarHash(user.password);

      const lastAcess: Date = new Date();

      const newUser: ResponseI = await User.create({
        email: user.email,
        password: user.password,
        fullName: user.fullName,
        lastAcess: lastAcess,
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

      const userExists: UserI | null = await User.findOne({ where: { email: user.email } });

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

      const lastAcess: Date = new Date();

      const update: ResponseI = await User.update(
        {
          lastAcess: lastAcess,
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

      const JWT_SECRET = process.env.SECRET_KEY;

      const token: string = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);

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
  public static async verifyJwt(token: string): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: 'Token inválido ou expirado.',
        success: false,
      };

      if (!token) {
        return (response = {
          message: 'Token não informado!',
          success: false,
        });
      }

      const JWT_SECRET: string | undefined = process.env.SECRET_KEY;

      if (!JWT_SECRET) {
        return (response = {
          message: 'Chave secreta não informada!',
          success: false,
        });
      }
      const decodedPayload: boolean = !!jwt.verify(token, JWT_SECRET);

      if (!decodedPayload) {
        return (response = {
          message: 'Token inválido!',
          success: false,
        });
        JWT_SECRET;
      } else {
        return (response = {
          message: 'Token válido!',
          success: true,
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

      const JWT_SECRET: string | undefined = process.env.SECRET_KEY;

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
}
