import { AuthService } from './auth.service';
import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  UserLoginRequest,
  UserRequest,
  UserResponse,
} from '../model/user.model';
import { AuthGuard } from './guards/auth.guard';
import { LogInterceptor } from '../log/log.interceptor';
import { User } from './decorators/auth.decorator';
@Controller('/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/')
  async create(@Body() request: UserRequest) {
    await this.authService.createUser(request);
    return `Username ${request.username} has been created successfully`;
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
