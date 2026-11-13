import { Global, Module } from "@nestjs/common";
import { MailService } from "@/mails/mail.service";

@Global()
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
