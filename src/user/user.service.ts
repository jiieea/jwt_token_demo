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
import { WebModel } from '../model/web.model';
import { Prisma } from '../generated/client';

const USER_SELECT = {
  username: true,
  role: true,
  avatar: true,
} satisfies Prisma.USERSelect;

@Injectable()
export class UserService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}

  private toUserResponse(user: UserResponse): UserResponse {
    return {
      username: user.username,
      role: user.role,
      avatar: user.avatar,
    };
  }

  private searchWhereInput(search?: string) {
    if (!search) return {};
    return {
      username: { contains: search },
    };
  }

  private async paginate(
    where: Prisma.USERWhereInput,
    page: number,
    size: number,
  ) {
    const skip = (page - 1) * size;
    const users = await this.prismaService.uSER.findMany({
      take: size,
      skip,
      where,
      select: USER_SELECT,
    });
    const total = await this.prismaService.uSER.count({ where });

    return {
      data: users.map((user) => this.toUserResponse(user)),
      paging: {
        pages: page,
        total_item: total,
        total_page: Math.ceil(total / total),
      },
    };
  }

  async findAll(page: number, size: number): Promise<WebModel<UserResponse[]>> {
    return this.paginate({}, page, size);
  }

  async deleteAvatar(username: string) {
    const user = await this.prismaService.uSER.findUnique({
      where: { username },
    });

    if (!user) {
      return `User not found`;
    }

    if (user.avatar) {
      const avatarPath = path.join(
        process.cwd(),
        'uploads/avatars',
        user.avatar,
      );

      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    await this.prismaService.uSER.update({
      where: { username },
      data: {
        avatar: null,
      },
    });

    return {
      message: 'Avatar Deleted',
      status: 'success',
    };
  }

  async update(
    username: string,
    request: UserUpdateRequest,
    file?: Express.Multer.File, // ava image
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

  async search(
    request: UserSearchRequest,
    size: number,
    page: number,
  ): Promise<WebModel<UserResponse[]>> {
    const { search } = this.validationService.validation(
      UserValidation.SEARCH,
      request,
    );

    return this.paginate(this.searchWhereInput(search), page, size);
  }
}
