import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { ROLE } from '../src/generated/enums';
@Injectable()
export class TestService implements OnModuleDestroy {
  constructor(private prisma: PrismaService) {}

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
  async deleteProduct() {
    await this.prisma.product.deleteMany({
      where: {
        product_name: 'Test',
      },
    });
  }
  async createUser() {
    const hashedPassword = await bcrypt.hash('123456', 10);
    await this.prisma.uSER.create({
      data: {
        username: 'TestSample',
        password: hashedPassword,
        role: ROLE.USER,
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

  async deleteAdmin() {
    await this.prisma.uSER.deleteMany({
      where: {
        username: 'AdminUser',
      },
    });
  }

  async createAdminUser() {
    const hashedPassword = await bcrypt.hash('adminUser', 10);
    await this.prisma.uSER.create({
      data: {
        username: 'AdminUser',
        password: hashedPassword,
        role: ROLE.ADMIN,
      },
    });
  }
}
