import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { LoginDto, RefreshTokenResponseDto } from './dto/auth.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private configService: ConfigService,
  ) {}

  async validateUser({
    email,
    password,
  }: LoginDto): Promise<{ id: string; email: string; role: string } | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      return user;
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  async login(user: { id: string; email: string; role: string }) {
    const payload = { email: user.email, id: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.createRefreshToken(user.id);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
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
}
