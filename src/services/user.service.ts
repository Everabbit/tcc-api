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
        sucess: false,
      };
      if (!user) {
        return (response = {
          message: 'Dados não informados!',
          sucess: false,
        });
      }

      const userExists: UserI[] = await User.findAll({ where: { email: user.email } });

      if (userExists.length > 0) {
        return (response = {
          message: 'Este email já foi cadastrado.',
          sucess: false,
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
            sucess: true,
            data: e,
          });
        })
        .catch(e => {
          console.log(e);
          return (response = {
            message: 'Erro ao adicionar usuário, verifique o log',
            sucess: false,
          });
        });

      return newUser;
    } catch (err) {
      let response: ResponseI = {
        message: '',
        sucess: false,
      };
      console.log(err);
      return (response = {
        message: 'Erro ao adicionar usuário, verifique o log',
        sucess: false,
      });
    }
  }
  public static async login(user: UserI): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        sucess: false,
      };
      if (!user) {
        return (response = {
          message: 'Dados não informados!',
          sucess: false,
        });
      }

      const userExists: UserI | null = await User.findOne({ where: { email: user.email } });

      if (!userExists) {
        return (response = {
          message: 'Usuário não encontrado!',
          sucess: false,
        });
      }

      const verifyPassword = await bcrypt.compare(user.password, userExists.password);
      console.log(user.password, userExists.password, verifyPassword);

      if (!verifyPassword) {
        return (response = {
          message: 'Senha incorreta.',
          sucess: false,
        });
      }

      const lastAcess: Date = new Date();

      const newUser: ResponseI = await User.update(
        {
          lastAcess: lastAcess,
        },
        { where: { email: userExists.email } }
      )
        .then(e => {
          return (response = {
            message: 'Login realizado com sucesso',
            sucess: true,
            data: e,
          });
        })
        .catch(e => {
          console.log(e);
          return (response = {
            message: 'Erro ao atualizar usuário, verifique o log',
            sucess: false,
          });
        });

      return newUser;
    } catch (err) {
      let response: ResponseI = {
        message: '',
        sucess: false,
      };
      console.log(err);
      return (response = {
        message: 'Erro ao realizar login de usuário, verifique o log',
        sucess: false,
      });
    }
  }
  public static async signJwt(user: UserI): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        sucess: false,
      };

      if (!user) {
        return (response = {
          message: 'Dados não informados!',
          sucess: false,
        });
      }

      const JWT_SECRET = process.env.SECRET_KEY;

      const token: string = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);

      response = {
        message: 'Token criado com sucesso!',
        sucess: true,
        data: token,
      };

      return response;
    } catch (err) {
      console.log(err);
      let response: ResponseI = {
        message: 'Erro ao gerar token de usuário, consulte o Log.',
        sucess: false,
      };
      return response;
    }
  }
}
