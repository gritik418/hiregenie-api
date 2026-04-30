import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async getMe(req: Request) {
    const userId = req.user?.id;

    if (!userId)
      throw new UnauthorizedException('Unauthenticated! Please login again.');

    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return {
      success: true,
      message: 'User fetched successfully.',
      user,
    };
  }
}
