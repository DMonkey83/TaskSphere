import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { UserResponse, UserResponseSchema } from '@shared/dto/user.dto';

import {
  CreateUserDto,
  RegisterFromInviteDto,
  UserResponseDto,
} from './dto/user.dto';
import type { Account, User, UserRoleEnum } from '../../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { OnBoardingService } from './../onboarding/on-boarding.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private prisma: PrismaService,
    private onboardingService: OnBoardingService,
  ) {}

  async findByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { account: true },
    });

    this.logger.log(`Finding user by email: ${email}`);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { account: true },
    });

    this.logger.log(`Finding user by ID: ${id}`);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return UserResponseSchema.parse(this.mapUserToResponse(user, user.account));
  }

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    this.logger.log(`Creating user with email: ${dto.email}`);
    try {
      const existing = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
          accountId: dto.accountId, // Ensure account ID is used for scoping
        },
      });
      if (existing) {
        throw new BadRequestException('A user with this email already exists');
      }

      const passwordHash = await bcrypt.hash(dto.passwordHash, 10);

      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          passwordHash: passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: (dto.role as UserRoleEnum) || 'member', // Default to 'member' if not provided
          accountId: dto.accountId,
          isEmailVerified: false,
          mfaEnabled: false,
          firstLoginAt: null,
          onboardingStep: 0,
          hasCompletedOnboarding: false,
        },
        include: { account: true },
      });
      this.logger.log(`User created successfully with ID: ${user.id}`);

      await this.onboardingService.createDraft(user.id);
      this.logger.log(`Onboarding draft created for user ID: ${user.id}`);

      return this.mapUserToResponse(user, user.account);
    } catch (error) {
      this.logger.error(
        `Error creating user: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async registerFromInvite(dto: RegisterFromInviteDto): Promise<UserResponse> {
    const invite = await this.prisma.accountInvite.findFirst({
      where: { token: dto.token, accepted: false },
      include: { accounts: true },
    });

    if (!invite || !invite.accounts) {
      throw new BadRequestException('Invalid or expired invite token');
    }

    this.logger.log('invite', invite);

    const existing = await this.prisma.user.findFirst({
      where: { email: invite.email, accountId: invite.accountId },
    });

    if (existing)
      throw new BadRequestException('A user with this email already exists');

    const result = await this.prisma.$transaction(async (tx) => {
      const passwordHash = await bcrypt.hash(dto.password, 10);

      const savedUser = await tx.user.create({
        data: {
          email: invite.email,
          passwordHash: passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: (dto.role as UserRoleEnum) || invite.role,
          accountId: invite.accountId,
          isEmailVerified: false,
          mfaEnabled: false,
        },
        include: { account: true },
      });

      await tx.accountInvite.update({
        where: { id: invite.id },
        data: { accepted: true },
      });

      return savedUser;
    });

    const response = {
      id: result.id,
      email: result.email,
      firstName: result.firstName,
      lastName: result.lastName,
      role: result.role,
      accountId: result.account.id,
    };

    try {
      return UserResponseSchema.parse(response);
    } catch (error) {
      throw new InternalServerErrorException(
        `Invalid user response format: ${error as string}`,
      );
    }
  }

  async updateRole(id: string, role: string): Promise<UserResponse> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          role: role as UserRoleEnum,
          updatedAt: new Date(),
        },
        include: { account: true },
      });
      return this.mapUserToResponse(user, user.account);
    } catch (error) {
      throw new NotFoundException('User not found', error);
    }
  }

  private mapUserToResponse(user: User, account: Account): UserResponse {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      account: {
        id: user.accountId,
        name: account.name,
      },
      firstLoginAt: user.firstLoginAt,
      hasCompletedOnboarding: user.hasCompletedOnboarding,
      onboardingStep: user.onboardingStep,
    };
  }
}
