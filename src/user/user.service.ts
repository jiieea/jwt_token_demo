import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { UserValidation } from './user.validation';
import { UserRequest, UserResponse } from '../model/user.model';
import { ValidationService } from '../validation/validation.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UserService {
  constructor(private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}

  async createUser(request: UserRequest): Promise<UserResponse> {
    const userRequest = this.validationService.validation<UserRequest>(
      UserValidation.REGISTER,
      request,
    );
    this.logger.info(`creating user ${userRequest.username}`);
    const duplicateUser = await this.prismaService.uSER.count({
      where: {
        username: request.username,
      },
    });
    if (duplicateUser != 0) {
      throw new HttpException('User already exists', HttpStatus.NOT_FOUND);
    }
    const saltRound = 10;
    userRequest.password = await bcrypt.hash(userRequest.password, saltRound);

    const user: UserResponse = await this.prismaService.uSER.create({
      data: userRequest,
    });

    return {
      username: user.username,
    };
  }
}
