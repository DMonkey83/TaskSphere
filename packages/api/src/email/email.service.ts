import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

export interface InviteEmailData {
  email: string;
  inviterName: string;
  accountName: string;
  inviteToken: string;
  role: string;
  expiresAt: Date;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendAccountInvite(data: InviteEmailData): Promise<boolean> {
    try {
      const frontendUrl = this.configService.get<string>(
        'FRONTEND_URL',
        'https://localhost:3001',
      );
      const inviteUrl = `${frontendUrl}/invite/accept?token=${data.inviteToken}`;

      await this.mailerService.sendMail({
        to: data.email,
        subject: `You're invited to join ${data.accountName} on TaskSphere`,
        template: './account-invite',
        context: {
          inviterName: data.inviterName,
          accountName: data.accountName,
          role: data.role,
          inviteUrl,
          email: data.email,
          expiresAt: data.expiresAt.toLocaleDateString(),
        },
      });

      this.logger.log(
        `Account invite email sent successfully to ${data.email}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send account invite email to ${data.email}`,
        (error as Error).message,
      );
      return false;
    }
  }

  async sendBulkAccountInvites(invites: InviteEmailData[]): Promise<{
    successful: string[];
    failed: string[];
  }> {
    const results = {
      successful: [] as string[],
      failed: [] as string[],
    };

    for (const invite of invites) {
      const success = await this.sendAccountInvite(invite);
      if (success) {
        results.successful.push(invite.email);
      } else {
        results.failed.push(invite.email);
      }
    }

    this.logger.log(
      `Bulk invite emails completed: ${results.successful.length} successful, ${results.failed.length} failed`,
    );

    return results;
  }

  async sendInviteResent(data: InviteEmailData): Promise<boolean> {
    try {
      const frontendUrl = this.configService.get<string>(
        'FRONTEND_URL',
        'https://localhost:3001',
      );
      const inviteUrl = `${frontendUrl}/invite/accept?token=${data.inviteToken}`;

      await this.mailerService.sendMail({
        to: data.email,
        subject: `Reminder: You're invited to join ${data.accountName} on TaskSphere`,
        template: './account-invite-resent',
        context: {
          inviterName: data.inviterName,
          accountName: data.accountName,
          role: data.role,
          inviteUrl,
          email: data.email,
          expiresAt: data.expiresAt.toLocaleDateString(),
        },
      });

      this.logger.log(
        `Account invite resent email sent successfully to ${data.email}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send resent invite email to ${data.email}`,
        (error as Error).message,
      );
      return false;
    }
  }
}
