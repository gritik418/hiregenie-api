import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import RegisterInputDto from './dto/register.dto';
import { HashingService } from 'src/common/hashing/hashing.service';
import LoginInputDto from './dto/login.dto';
import { Response } from 'express';
import { AUTH_COOKIE_NAME } from 'src/common/constants/cookie-names';
import { cookieOptions } from 'src/common/constants/cookie-options';
import { JwtService } from '@nestjs/jwt';
import JWTPayload from './types/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: RegisterInputDto) {
    const { name, email, password } = data;
    const now = new Date();

    const existingUser = await this.prismaService.user.findUnique({
      where: {
        email,
      },
      select: {
        isEmailVerified: true,
        emailVerificationToken: true,
        emailVerificationTokenExpiry: true,
      },
    });

    if (existingUser) {
      if (existingUser.isEmailVerified) {
        throw new BadRequestException('User already exists.');
      }

      if (
        existingUser.emailVerificationToken &&
        existingUser.emailVerificationTokenExpiry &&
        new Date(existingUser.emailVerificationTokenExpiry).getTime() >
          now.getTime()
      ) {
        throw new BadRequestException(
          'Check your email for verification code.',
        );
      }

      await this.prismaService.user.delete({
        where: {
          email,
        },
      });
    }

    const hashedPassword = await this.hashingService.hashValue(password);

    const user = await this.prismaService.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isEmailVerified: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return {
      success: true,
      message: 'User registered successfully.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  async login(data: LoginInputDto, res: Response) {
    const { email, password } = data;

    const user = await this.prismaService.user.findUnique({
      where: {
        email,
        isEmailVerified: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
      },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials.');

    const isPasswordValid = await this.hashingService.compareValue(
      password,
      user.password,
    );

    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials.');

    const payload: JWTPayload = {
      id: user.id,
      email: user.email,
    };

    const token = this.jwtService.sign(payload);

    res.cookie(AUTH_COOKIE_NAME, token, cookieOptions);

    return {
      success: true,
      message: 'Logged in successfully.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}
