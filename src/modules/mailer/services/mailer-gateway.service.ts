import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { IMailerGateway } from '../imailer-gateway.interface';

@Injectable()
export class MailerGateway implements IMailerGateway {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'localhost',
      port: 1025,
      secure: false,
      auth: {
        user: 'root',
        pass: 'root',
      },
    });
  }

  async sendEmail(input: { to: string; html?: string; subject: string }) {
    await this.transporter.sendMail({
      from: 'citynexus@citynexus.com',
      to: input.to,
      html: input.html,
      subject: input.subject,
    });
  }
}
