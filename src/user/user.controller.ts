import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import {
  UserLoginRequest,
  UserRequest,
  UserResponse,
} from '../model/user.model';
import { AuthGuard } from '../auth/auth.guard';

@Controller('/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('')
  async create(@Body() request: UserRequest) {
    await this.userService.createUser(request);
    return 'User created';
  }

  @Post('/login')
  signIn(@Body() signInDto: UserLoginRequest): Promise<UserResponse> {
    return this.userService.login(signInDto);
  }

  @UseGuards(AuthGuard) // Pasang Guard di sini
  @Get('/profile')
  getProfile(@Req() req) {
    return {
      message: 'Ini data profil kamu',
      user: req.user,
    };
  }
}
