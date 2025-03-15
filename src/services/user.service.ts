import { User, UserI } from '../models/user.model';
const bcrypt = require('bcrypt');

async function gerarHash(senha: string): Promise<string> {
  const saltRounds: number = Number(process.env.SALT);
  const hash: string = await bcrypt.hash(senha, saltRounds);
  return hash;
}

export default class UserService {
  public static async create(user: UserI): Promise<string> {
    try {
      if (!user) {
        return 'Nenhuma informação enviada';
      }

      user.password = await gerarHash(user.password);

      const sucess: string = await User.create({
        email: user.email,
        password: user.password,
        name: user.name,
      })
        .then(e => {
          return 'Sucesso';
        })
        .catch(e => {
          console.log(e);
          return `Falha: ${e}`;
        });

      return sucess;
    } catch (err) {
      console.log(err);
      return `Falha: ${err}`;
    }
  }
}
