import { Module } from '@nestjs/common';
import { CommonModule } from '../src/common/common.module';
import { TestService } from './test.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { UserValidation } from '../src/user/user.validation';
import { UserFilter } from '../src/user/user.filter';

@Module({
  imports: [CommonModule],
  providers: [TestService, PrismaService],
})
export class TestModule {}
