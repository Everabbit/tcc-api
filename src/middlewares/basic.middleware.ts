import { ResponseI } from '../interfaces/response.interface';
import userService from '../services/user.service';

export default class BasicMiddleware {
  public async validateToken(req: any, res: any, next: any) {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: 'Token não informado' });
    }
    const tokenValue = token.split(' ')[1];
    if (!tokenValue) {
      return res.status(401).json({ message: 'Token não informado' });
    }

    const tokenId: ResponseI = await userService.verifyJwt(tokenValue);
    if (!tokenId.sucess) {
      return res.status(401).json({ message: 'Token inválido' });
    }
    const userId: ResponseI = await userService.getJwtId(tokenValue);
    console.log(userId);
    req.params.userId = userId;
    next();
  }
}
