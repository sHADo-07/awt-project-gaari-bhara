import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { appConfig } from "@/config/app.config";
import { welcomeTemplate } from "@/mails/templates/welcome.template";

/**
 * Bonus: Mailer.
 * With MAILER_HOST in .env (for example a Mailtrap sandbox) it sends real emails.
 * With MAILER_HOST empty, it only writes the email in the log, so the app works on every laptop.
 * A failed email is only logged. It never breaks a request.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger("Mail");
  private readonly env = appConfig.env;

  private readonly transporter = this.env.MAILER_HOST
    ? nodemailer.createTransport({
        host: this.env.MAILER_HOST,
        port: this.env.MAILER_PORT,
        secure: this.env.MAILER_SECURE,
        auth: this.env.MAILER_USER ? { user: this.env.MAILER_USER, pass: this.env.MAILER_PASSWORD } : undefined,
      })
    : nodemailer.createTransport({ jsonTransport: true });

  async send(to: string, content: { subject: string; text: string }) {
    try {
      await this.transporter.sendMail({ from: this.env.MAILER_FROM, to, subject: content.subject, text: content.text });
      if (!this.env.MAILER_HOST) this.logger.log(`(no MAILER_HOST) email to ${to}: ${content.subject}`);
      return true;
    } catch (error) {
      this.logger.error(`Could not send email to ${to}: ${(error as Error).message}`);
      return false;
    }
  }

  sendWelcome(to: string, fullName: string) {
    return this.send(to, welcomeTemplate(fullName));
  }
}
