import { ThrottlerException, ThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';
@Injectable()
export class CustomThrottleGuard extends ThrottlerGuard {
  protected throwThrottlingException(): Promise<void> {
    throw new ThrottlerException(
      'You are sending too many request , please try again a minuter and try again',
    );
  }
}
