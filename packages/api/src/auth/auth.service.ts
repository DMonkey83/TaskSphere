import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import {
  LoginDto,
  RefreshTokenResponseDto,
  UserEntity,
  UserPayload,
} from './dto/auth.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { LoginResponse } from '@shared/dto/auth.dto';
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
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      this.logger.warn(`User not found for email: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
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
      account: { id: user.id },
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = await this.createRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
    };
  }

  async createRefreshToken(userId: string): Promise<string> {
    const token = uuidv4();
    const tokenHash = await bcrypt.hash(token, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const refreshToken = this.refreshTokenRepository.create({
      user: { id: userId },
      tokenHash,
      expiresAt,
    });
    await this.refreshTokenRepository.save(refreshToken);
    return token;
  }

  async refreshToken(rToken: string): Promise<RefreshTokenResponseDto> {
    const storedToken = await this.refreshTokenRepository.findOne({
      where: { tokenHash: await bcrypt.hash(rToken, 10), revoked: false },
      relations: ['user'],
    });
    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    storedToken.revoked = true;
    await this.refreshTokenRepository.save(storedToken);

    const payload = {
      email: storedToken.user.email,
      userId: storedToken.user.id,
      role: storedToken.user.role,
    };
    const accessToken = this.jwtService.sign(payload);
    const newRefreshToken = await this.createRefreshToken(storedToken.user.id);

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
    };
  }

  async revokeRefreshToken(rToken: string): Promise<void> {
    const storedToken = await this.refreshTokenRepository.findOne({
      where: { tokenHash: await bcrypt.hash(rToken, 10) },
    });
    if (storedToken) {
      storedToken.revoked = true;
      await this.refreshTokenRepository.save(storedToken);
    }
  }

  private async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
