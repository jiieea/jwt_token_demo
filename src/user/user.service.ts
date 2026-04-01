import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { UserValidation } from './user.validation';
import * as fs from 'fs';
import * as path from 'path';
import {
  UserLoginRequest,
  UserLoginResponse,
  UserRequest,
  UserResponse,
  UserUpdateRequest,
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
    // 1. Validasi Input
    const userLogin = this.validationService.validation(
      UserValidation.LOGIN,
      request,
    );

    // 2. Cari di Database
    const user = await this.prismaService.uSER.findUnique({
      where: { username: userLogin.username },
    });
    console.log('3. Database Result:', user); // LIHAT DI SINI
    // 4. Cek Password
    // 3. Cek apakah user ada
    if (!user) {
      throw new HttpException(
        `User ${userLogin.username} tidak ditemukan`,
        HttpStatus.NOT_FOUND,
      );
    }

    const isPasswordValid = await bcrypt.compare(
      userLogin.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new HttpException('Password salah', HttpStatus.UNAUTHORIZED);
    }

    // 5. Buat Payload & Token (Gunakan data dari 'user' DB agar lebih akurat)
    const payload = {
      username: user.username,
      role: user.role,
    };
    const token = await this.jwtService.signAsync(payload);
    // 6. Update Token di DB
    await this.prismaService.uSER.update({
      where: { username: user.username },
      data: { token: token },
    });

    // 7. Kembalikan Response
    return {
      username: user.username,
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
}
