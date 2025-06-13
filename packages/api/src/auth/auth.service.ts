import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';

import { LoginResponse } from '@shared/dto/auth.dto';

import {
  LoginDto,
  RefreshTokenResponseDto,
  UserEntity,
  UserPayload,
} from './dto/auth.dto';
import { UsersService } from '../users/users.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private configService: ConfigService,
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

  async login(user: UserEntity): Promise<LoginResponse> {
    this.logger.log(`Generating JWT tokens for user: ${user.email}`);
    const payload: UserPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      account: { id: user.account.id },
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
      const storedToken = await this.refreshTokenRepository.findOne({
        where: { token: rToken, revoked: false },
        relations: ['user'],
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
      storedToken.revoked = true;
      await this.refreshTokenRepository.save(storedToken);

      // Generate new tokens
      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
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
        const savedToken = await this.refreshTokenRepository.save({
          token: refreshToken,
          user: { id: userId }, // Explicit user_id
          expiresAt,
          createdAt: new Date(),
          revoked: false,
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
