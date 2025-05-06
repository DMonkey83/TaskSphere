import { User } from './../users/entities/user.entity';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountInvite } from './entities/account-invite.entity';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import dayjs from 'dayjs';

@Injectable()
export class AccountInvitesService {
  constructor(
    @InjectRepository(AccountInvite)
    private invitesRepository: Repository<AccountInvite>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  async createInvite(
    email: string,
    userId: string,
    role: string,
  ): Promise<AccountInvite> {
    const token = randomUUID();
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['account'],
    });
    console.log('user account', user, userId);
    if (!user?.account) throw new NotFoundException('User not found');
    const invite = this.invitesRepository.create({
      email,
      token,
      role,
      expiresAt: dayjs().add(7, 'days').toDate(),
      account: { id: user.account.id },
    });
    return this.invitesRepository.save(invite);
  }

  async validateInvite(token: string): Promise<AccountInvite> {
    const invite = await this.invitesRepository.findOne({
      where: { token, accepted: false },
      relations: ['account'],
    });

    if (!invite || invite.expiresAt < new Date()) {
      throw new BadRequestException('Invite is invalid or expired');
    }

    return invite;
  }

  async markInviteAsUsed(inviteId: string) {
    await this.invitesRepository.update(inviteId, { accepted: true });
  }
}
