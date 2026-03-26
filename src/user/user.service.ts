import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { UserValidation } from './user.validation';
import * as client from '@prisma/client';
import {
  UserLoginRequest,
  UserLoginResponse,
  UserLogoutResponse,
  UserRequest,
  UserResponse,
} from '../model/user.model';
import { ValidationService } from '../validation/validation.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    private validationService: ValidationService,
    private jwtService: JwtService,
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

  async login(request: UserLoginRequest): Promise<UserLoginResponse> {
    const userLogin: UserLoginRequest = this.validationService.validation(
      UserValidation.LOGIN,
      request,
    );

    const user = await this.prismaService.uSER.findUnique({
      where: {
        username: userLogin.username,
      },
    });
    if (!user) {
      throw new HttpException(
        'Password or username invalid',
        HttpStatus.NOT_FOUND,
      );
    }

    const password = await bcrypt.compare(userLogin.password, user.password);
    if (!password) {
      throw new HttpException('Invalid password', HttpStatus.NOT_FOUND);
    }
    const payload = { username: userLogin.username };
    const token = await this.jwtService.signAsync(payload);

    await this.prismaService.uSER.update({
      where: { username: user.username },
      data: {
        token: token,
      },
    });

    return {
      username: userLogin.username,
      message: 'Login berhasil',
      token: token,
    };
  }

  async logout(username: string): Promise<boolean> {
    await this.prismaService.uSER.update({
      where: { username: username },
      data: {
        token: null,
      },
    });

    return true;
  }
}
