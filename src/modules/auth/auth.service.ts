import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import RegisterInputDto from './dto/register.dto';
import { HashingService } from 'src/common/hashing/hashing.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashingService: HashingService,
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
        isEmailVerified: true, // TODO: Remove this
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return {
      success: true,
      message: 'User registered successfully. Check email for verification.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}
