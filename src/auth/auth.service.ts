import { PrismaService } from '../prisma/prisma.service';
import { HttpException, HttpStatus, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import {
  UserLoginRequest,
  UserLoginResponse,
  UserRequest,
  UserResponse,
} from '../model/user.model';
import { UserValidation } from '../user/user.validation';
import * as bcrypt from 'bcrypt';
import { ValidationService } from '../validation/validation.service';
import { JwtService } from '@nestjs/jwt';

export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly validationService: ValidationService,
  ) {}

  async createUser(req: UserRequest): Promise<UserResponse> {
    const userRequest = this.validationService.validation<UserRequest>(
      UserValidation.REGISTER,
      req,
    );
    this.logger.info(`creating user ${userRequest.username}`);
    const duplicateUser = await this.prismaService.uSER.count({
      where: {
        username: req.username,
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

  async login(req: UserLoginRequest): Promise<UserLoginResponse> {
    // 1. Validasi Input
    const userLogin = this.validationService.validation(
      UserValidation.LOGIN,
      req,
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
}
