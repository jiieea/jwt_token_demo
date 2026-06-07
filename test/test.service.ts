import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { ROLE } from '../src/generated/enums';
import { ProductResponse } from '../src/model/product.model';
@Injectable()
export class TestService implements OnModuleDestroy {
  constructor(private prisma: PrismaService) {}

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
  async deleteProduct() {
    await this.prisma.product.deleteMany({
      where: {
        product_name: 'AdminUser',
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

  async deleteAdmin() {
    // 1. Delete carts that reference AdminUser's products
    await this.prisma.cART.deleteMany({
      where: {
        username: 'AdminUser',
      },
    });

    // 2. Delete products belonging to AdminUser
    await this.prisma.product.deleteMany({
      where: {
        username: 'AdminUser',
      },
    });

    // 3. Now safe to delete the user
    await this.prisma.uSER.deleteMany({
      where: {
        username: 'AdminUser',
      },
    });
  }

  async deleteUser() {
    await this.prisma.cART.deleteMany({ where: { username: 'TestSample' } });
    await this.prisma.product.deleteMany({ where: { username: 'TestSample' } });
    await this.prisma.uSER.deleteMany({ where: { username: 'TestSample' } });
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

  async getProduct(): Promise<ProductResponse | null> {
    return this.prisma.product.findFirst({
      where: {
        username: 'AdminUser',
      },
    });
  }

  async createProduct() {
    await this.prisma.product.create({
      data: {
        username: 'AdminUser',
        product_name: 'Product Test',
        price: 10304,
        quantity: 10,
        product_image: 'test.jpg',
      },
    });
  }
}
