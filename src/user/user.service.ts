import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { UserValidation } from './user.validation';
import * as fs from 'fs';
import * as path from 'path';
import {
  UserResponse,
  UserSearchRequest,
  UserUpdateRequest,
} from '../model/user.model';
import { ValidationService } from '../validation/validation.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { USER } from '../generated/client';

@Injectable()
export class UserService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}

  async findAll() {
    return this.prismaService.uSER.findMany({
      select: {
        username: true,
        token: true,
        role: true,
      },
    });
  }

  async update(
    username: string,
    request: UserUpdateRequest,
    file?: Express.Multer.File,
  ) {
    const userUpdate = this.validationService.validation(
      UserValidation.UPDATE,
      request,
    );
    const user = await this.prismaService.uSER.findUnique({
      where: { username: username },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const updatedUser: any = {};
    if (userUpdate.password) {
      updatedUser.password = await bcrypt.hash(userUpdate.password, 10);
    }

    if (file) {
      if (user.avatar) {
        const oldPath = path.join(
          process.cwd(),
          'uploads/avatars',
          user.avatar,
        );
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      updatedUser.avatar = file.filename;
    }
    return this.prismaService.uSER.update({
      where: { username: username },
      data: updatedUser,
      select: {
        username: true,
        password: true,
        avatar: true,
      },
    });
  }

  toContactResponse(user: UserResponse): UserResponse {
    return {
      username: user.username,
      role: user.role,
    };
  }

  async search(request: UserSearchRequest) {
    const searchRequest = this.validationService.validation(
      UserValidation.SEARCH,
      request,
    );

    const whereCondition: any = {};

    if (searchRequest.search) {
      whereCondition.AND = [
        {
          username: {
            contains: searchRequest.search,
          },
        },
      ];
    }
    console.log('WHERE:', JSON.stringify(whereCondition, null, 2));
    console.log('Search', searchRequest);
    const users = await this.prismaService.uSER.findMany({
      where: whereCondition,
    });
    const total = await this.prismaService.uSER.count({
      where: whereCondition,
    });

    return {
      data: users.map((user) => this.toContactResponse(user)),
      total: total,
    };
  }
}
