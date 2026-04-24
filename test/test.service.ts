import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';

@Injectable()
export class TestService implements OnModuleDestroy {
  constructor(private prisma: PrismaService) {}

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  async createUser() {
    await this.prisma.uSER.create({
      data: {
        username: 'TestSample',
        password: '123456',
      },
    });
  }

  async deleteUser() {
    await this.prisma.uSER.deleteMany({
      where: {
        username: 'TestSample',
      },
    });
  }
}
