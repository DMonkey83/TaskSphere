import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { PrismaModule } from 'src/prisma/prisma.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { RefreshTokenInterceptor } from './refresh-token.interceptor';
import { RoleGuard, ProjectRoleGuard } from './role.guard';
import { AccountsModule } from '../accounts/accounts.module';
import { ProjectMemberModule } from '../project-members/project-member.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AccountsModule,
    forwardRef(() => ProjectMemberModule),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RoleGuard,
    ProjectRoleGuard,
    {
      provide: APP_INTERCEPTOR,
      useClass: RefreshTokenInterceptor,
    },
  ],
  exports: [
    AuthService,
    JwtStrategy,
    PassportModule,
    RoleGuard,
    ProjectRoleGuard,
  ],
})
export class AuthModule {}
