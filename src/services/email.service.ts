import { ResponseI } from '../interfaces/response.interface';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

export default class EmailService {
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

      await resend.emails.send({
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
