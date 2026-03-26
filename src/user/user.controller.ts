import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  UserLoginRequest,
  UserRequest,
  UserResponse,
} from '../model/user.model';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../auth/auth.decorator';

@Controller('/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/')
  async create(@Body() request: UserRequest) {
    await this.userService.createUser(request);
    return 'User created';
  }

  @Post('/login')
  signIn(@Body() signInDto: UserLoginRequest): Promise<UserResponse> {
    return this.userService.login(signInDto);
  }

  @UseGuards(AuthGuard)
  @Get('/profile')
  getProfile(@User('username') user) {
    return {
      message: 'Ini data profil kamu',
      user: user,
    };
  }

  @UseGuards(AuthGuard)
  @Post('/logout')
  async logout(@User('username') username: string) {
    console.log('Username yang diterima Decorator:', username); // <-- CEK DI SINI

    if (!username) {
      throw new HttpException(
        'Username tidak terbaca dari token',
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.userService.logout(username);
    return 'User logged out';
  }
}
