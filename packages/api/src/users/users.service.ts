import { AccountInvite } from './../account-invites/entities/account-invite.entity';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreateUserDto,
  RegisterFromInviteDto,
  UserResponseDto,
} from './dto/user.dto';
import { AccountInvitesService } from '../account-invites/account-invites.service';
import { UserResponseSchema } from '@shared/dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private inviteService: AccountInvitesService,
    @InjectRepository(AccountInvite)
    private inviteRepository: Repository<AccountInvite>,
  ) {}

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['account'], // Ensure account relation is loaded
      select: ['id', 'email', 'account', 'role', 'passwordHash'],
    });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['account'], // Ensure account relation is loaded
      select: [
        'id',
        'email',
        'account',
        'role',
        'account',
        'firstName',
        'lastName',
      ],
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const passwordHash = await bcrypt.hash(dto.passwordHash, 10);
    const user = this.usersRepository.create({
      email: dto.email,
      account: { id: dto.accountId }, // Ensure account is properly referenced
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role || 'member',
    });
    return this.usersRepository.save(user);
  }

  async registerFromInvite(
    dto: RegisterFromInviteDto,
  ): Promise<UserResponseDto> {
    const invite = await this.inviteRepository.findOne({
      where: { token: dto.token, accepted: false },
    });

    if (!invite) {
      throw new BadRequestException('Invalid or expired invite token');
    }

    console.log('invite', invite);

    const existing = await this.usersRepository.findOne({
      where: { email: invite.email, account: { id: invite.account.id } },
    });

    if (existing)
      throw new BadRequestException('A user with this email already exists');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepository.create({
      email: invite.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role || invite.role,
      account: { id: invite.account.id },
      isEmailVerified: false,
      mfaEnabled: false,
    });

    const savedUser = await this.usersRepository.save(user);
    invite.accepted = true;
    await this.inviteService.markInviteAsUsed(invite.id);

    const response = {
      id: savedUser.id,
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      role: savedUser.role,
      accountId: savedUser.account.id,
    };

    try {
      return UserResponseSchema.parse(response);
    } catch (err) {
      throw new InternalServerErrorException(
        `Invalid user response structure: ${err as string}`,
      );
    }
  }

  async updateRole(id: string, role: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) throw new NotFoundException('User not found');
    Object.assign(user, {
      role,
    });
    return this.usersRepository.save(user);
  }
}
