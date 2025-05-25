import { Request, Response, NextFunction } from 'express';

import userService from '../services/user.service';
import { ResponseI } from '../interfaces/response.interface';
import ResponseValidator from '../utils/reponse.utils';
import { HttpStatus } from '../enums/res_status.enum';

export default class BasicMiddleware {
  public async validateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ResponseValidator.response(req, res, HttpStatus.UNAUTHORIZED, {
        message: 'Token inválido.',
        success: false,
      });
    }
    const tokenValue = authHeader.split(' ')[1];
    const tokenValidationResponse: ResponseI = await userService.getJwtId(tokenValue);

    if (!tokenValidationResponse.success || !tokenValidationResponse.data) {
      const message = tokenValidationResponse.message || 'Token inválido.';
      return ResponseValidator.response(req, res, HttpStatus.UNAUTHORIZED, {
        message: 'Token inválido.',
        success: false,
      });
    }
    const decodedPayload: number = tokenValidationResponse.data;

    if (typeof decodedPayload !== 'number') {
      return ResponseValidator.response(req, res, HttpStatus.UNAUTHORIZED, {
        message: 'Token inválido.',
        success: false,
      });
    }
    (req as any).params = { ...req.params, userId: decodedPayload.toString() };

    next();
  }
}
