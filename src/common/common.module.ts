import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { ProductModule } from '../product/product.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CartModule } from '../cart/cart.module';
import { CustomThrottleGuard } from '../guard/throttle.guard';
@Module({
  imports: [
    WinstonModule.forRoot({
      format: winston.format.json(),
      level: 'debug',
      transports: [new winston.transports.Console()],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    UserModule,
    CartModule,
    ProductModule,
    AuthModule,
  ],
  // providers: [
  //   {
  //     provide: APP_GUARD,
  //     useClass: CustomThrottleGuard,
  //   },
  // ],
})
export class CommonModule {}
