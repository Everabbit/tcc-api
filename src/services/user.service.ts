import { ResponseI } from '../models/response.model';
import { User, UserI } from '../models/user.model';
const bcrypt = require('bcrypt');

async function gerarHash(senha: string): Promise<string> {
  const saltRounds: number = Number(process.env.SALT);
  const hash: string = await bcrypt.hash(senha, saltRounds);
  return hash;
}

export default class UserService {
  public static async create(user: UserI): Promise<ResponseI> {
    try {
      let response: ResponseI = {};
      if (!user) {
        return (response = {
          message: 'Dados não informados!',
          data: false,
        });
      }

      const userExists: UserI[] = await User.findAll({ where: { username: user.username } });

      if (userExists.length > 0) {
        return (response = {
          message: 'Este nome de usuário já foi cadastrado.',
          data: false,
        });
      }

      user.password = await gerarHash(user.password);

      const newUser: ResponseI = await User.create({
        email: user.email,
        password: user.password,
        name: user.name,
      })
        .then(e => {
          return (response = {
            message: 'Usuário adicionado com sucesso',
            data: true,
          });
        })
        .catch(e => {
          console.log(e);
          return (response = {
            message: 'Erro ao adicionar usuário, verifique o log',
            data: false,
          });
        });

      return newUser;
    } catch (err) {
      let response: ResponseI = {};
      console.log(err);
      return (response = {
        message: 'Erro ao adicionar usuário, verifique o log',
        data: false,
      });
    }
  }
}
