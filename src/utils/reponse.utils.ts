import { ResponseI } from '../interfaces/response.interface';
import { Request, Response } from 'express';

export default class ResponseValidator {
  public static response(req: Request, res: Response, status: number, response: ResponseI): void {
    if (!response.data) {
      response.data = {};
    }
    if (!status) {
      status = 200;
    }
    if (!response.message) {
      response.message = '';
    }

    res.status(status).json(response);
  }
}
