import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
@Injectable()
export class TestService implements OnModuleDestroy {
  constructor(private prisma: PrismaService) {}

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  async createUser() {
    const hashedPassword = await bcrypt.hash('123456', 10);
    await this.prisma.uSER.create({
      data: {
        username: 'TestSample',
        password: hashedPassword,
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
