import axios from 'axios';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import { ResponseI } from '../interfaces/response.interface';

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';

export default class EmailService {
  public static async sendEmail(
    to: string,
    subject: string,
    templateName: string,
    context: object
  ): Promise<ResponseI> {
    try {
      const templatePath = path.resolve(__dirname, '..', 'templates', 'emails', `${templateName}.hbs`);
      const source = fs.readFileSync(templatePath, 'utf-8');
      const template = handlebars.compile(source);
      const html = template(context);

      if (!BREVO_API_KEY) {
        return { message: 'BREVO_API_KEY não configurada', success: false };
      }

      const payload = {
        sender: { name: 'Equipe TaskForge', email: process.env.EMAIL_USER },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      };

      const res = await axios.post(BREVO_URL, payload, {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      });

      if (res.status !== 200 && res.status !== 201) {
        return { message: `Erro ao enviar e-mail: ${res.statusText}`, success: false };
      }

      return { message: 'E-mail enviado com sucesso!', success: true };
    } catch (err: any) {
      console.error('Erro ao enviar e-mail (Brevo):', err?.response?.data ?? err.message);
      return { message: `Erro ao enviar e-mail: ${err?.response?.data?.message ?? err.message}`, success: false };
    }
  }
}
