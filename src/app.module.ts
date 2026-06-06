import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { ValidationService } from './validation/validation.service';
import { TestModule } from '../test/test.module';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [CommonModule, TestModule],
  controllers: [AppController],
  providers: [AppService, ValidationService],
})
export class AppModule {}
