import { ResponseI } from '../interfaces/response.interface';
import nodemailer, { Transporter } from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';

const transporter: Transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export default class EmailService {
  public static async verifyConnection(): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      await transporter.verify();

      response = {
        message: 'Conexão com o servidor de e-mail verificada com sucesso!',
        success: true,
      };
      return response;
    } catch (err: any) {
      console.log(err);
      let response: ResponseI = {
        message: `Erro ao verificar conexão com o servidor de e-mail: ${err.message}`,
        success: false,
      };
      return response;
    }
  }

  public static async sendEmail(
    to: string,
    subject: string,
    templateName: string,
    context: object
  ): Promise<ResponseI> {
    try {
      let response: ResponseI = {
        message: '',
        success: false,
      };

      const templatePath = path.resolve(__dirname, '..', 'templates', 'emails', `${templateName}.hbs`);
      const source = fs.readFileSync(templatePath).toString('utf-8');
      const template = handlebars.compile(source);
      const html = template(context);

      await transporter.sendMail({
        from: `"${process.env.EMAIL_ALIAS}" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });

      response = {
        message: 'E-mail enviado com sucesso!',
        success: true,
      };
      return response;
    } catch (err: any) {
      console.log(err);
      let response: ResponseI = {
        message: `Erro ao enviar e-mail: ${err.message}`,
        success: false,
      };
      return response;
    }
  }
}
