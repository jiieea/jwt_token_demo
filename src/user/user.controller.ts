import { Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRequest } from '../model/user.model';

@Controller('/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/create')
  async create(request: UserRequest) {
    await this.userService.createUser(request);
    return 'User created';
  }
}
