export interface IMailerGateway {
  sendEmail(input: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void>;
}
