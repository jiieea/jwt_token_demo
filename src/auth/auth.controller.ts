import { AuthService } from './auth.service';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  UserLoginRequest,
  UserRequest,
  UserResponse,
} from '../model/user.model';
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
}
