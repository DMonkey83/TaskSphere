import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User, UserRoleEnum } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

import { LoginServiceResponse } from '@shared/dto/auth.dto';

import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import {
  LoginDto,
  RefreshTokenResponseDto,
  UserEntity,
  UserPayload,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async validateUser({ email, password }: LoginDto): Promise<User> {
    this.logger.log(`Validating user with email: ${email}`);
    let user: User;
    try {
      user = await this.usersService.findByEmail(email);
    } catch (error) {
      if (error) {
        this.logger.warn(`User not found for email: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }
      throw error;
    }

    const isPasswordValid = await this.comparePassword(
      password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      this.logger.warn(`Invalid password for user: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(user: UserEntity): Promise<LoginServiceResponse> {
    this.logger.log(`Generating JWT tokens for user: ${user.email}`);

    // Check if this is a first-time login before updating
    const isFirstLogin = !user.firstLoginAt;

    // Handle first-time login
    if (isFirstLogin) {
      this.logger.log(`First-time login detected for user: ${user.email}`);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { firstLoginAt: new Date() },
      });
      this.logger.log(`Updated firstLoginAt for user: ${user.email}`);
    }

    const payload: UserPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      account: { id: user.account.id },
      isFirstLogin, // Add the flag to the payload
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = await this.createRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(rToken: string): Promise<RefreshTokenResponseDto> {
    try {
      // Verify JWT
      const { id } = this.jwtService.verify<{ id: string }>(rToken);
      const user = await this.usersService.findById(id);
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      this.logger.log(
        `User found for refresh token: ${user.id} and refresh token`,
      );
      // Find stored token
      const storedToken = await this.prisma.refreshToken.findFirst({
        where: { token: rToken, revoked: false },
      });

      this.logger.log(
        `Refresh token request received, rToken: ${rToken.slice(0, 20)}..., storedToken: ${
          storedToken ? storedToken.id : 'not found'
        }`,
      );

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      // Revoke old token
      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revoked: true },
      });

      // Generate new tokens
      const payload: UserPayload = {
        userId: user.id,
        email: user.email,
        role: user.role as UserRoleEnum,
        account: { id: user.account.id },
      };

      const access_token = this.jwtService.sign(payload, { expiresIn: '15m' });
      const refresh_token = await this.createRefreshToken(user.id);
      this.logger.log(
        `New refresh token created: ${refresh_token.slice(0, 20)}...`,
      );

      return { access_token, refresh_token };
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Refresh token error: ${error.message}`);
      } else {
        this.logger.error('Refresh token error: Unknown error');
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async createRefreshToken(userId: string): Promise<string> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      this.logger.error(`No user found for ID: ${userId}`);
      throw new UnauthorizedException('Invalid user ID');
    }

    const refreshToken = this.jwtService.sign(
      { id: userId },
      { expiresIn: '7d' },
    );
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        this.logger.log(
          `Attempt ${attempt} to save refresh token for user: ${userId}`,
        );
        const savedToken = await this.prisma.refreshToken.create({
          data: {
            token: refreshToken,
            user: { connect: { id: userId } }, // Explicit user_id
            expiresAt,
            createdAt: new Date(),
            revoked: false,
          },
        });
        this.logger.log(
          `Saved refresh token: ${savedToken.id} for user: ${userId}`,
        );
        return refreshToken;
      } catch (error) {
        this.logger.error(
          `Attempt ${attempt} failed to save refresh token: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
        if (attempt === 3) {
          throw new Error(
            `Failed to save refresh token after 3 attempts: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
          );
        }
      }
    }
    throw new Error('Failed to save refresh token');
  }

  private async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
