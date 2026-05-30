import { AuthService } from './auth.service';
import {
  Body,
  Controller,
  HttpCode,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  UserLoginRequest,
  UserRequest,
  UserResponse,
} from '../model/user.model';
import { AuthGuard } from '../guard/auth.guard';
import { LogInterceptor } from '../log/log.interceptor';
import { User } from './decorators/auth.decorator';
import { Throttle } from '@nestjs/throttler';

@Throttle({ default: { ttl: 60000, limit: 3 } })
@Controller('/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/')
  @HttpCode(201)
  async create(@Body() request: UserRequest) {
    const user = await this.authService.createUser(request);
    return user;
  }

  @Post('/login')
  signIn(@Body() signInDto: UserLoginRequest): Promise<UserResponse> {
    console.log('Data yang masuk ke Controller:', signInDto);
    return this.authService.login(signInDto);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(LogInterceptor)
  @Post('/logout')
  logout(@User('username') username: string) {
    return this.authService.logout(username);
  }
}
