import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpException,
  HttpStatus,
  Delete,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  UserLoginRequest,
  UserRequest,
  UserResponse,
} from '../model/user.model';
import { AuthGuard } from '../auth/guards/auth.guard';
import { User } from '../auth/decorators/auth.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLE } from '../generated/enums';
import { LogInterceptor } from '../log/log.interceptor';

@UseInterceptors(LogInterceptor)
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

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN)
  @Delete('/:username')
  deleteUser(@Param('username') username: string) {
    return `User ${username} berhasil dihapus oleh Admin`;
  }

  @Get('/users')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN)
  async getUsers() {
    const users = await this.userService.findAll();
    return {
      success: true,
      data: users,
    };
  }
}
