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
  Patch,
  UploadedFile,
} from '@nestjs/common';
import { UserService } from './user.service';
import { extname, join } from 'path';
import {
  UserLoginRequest,
  UserRequest,
  UserResponse,
  UserUpdateRequest,
} from '../model/user.model';
import { AuthGuard } from '../auth/guards/auth.guard';
import { User } from '../auth/decorators/auth.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLE } from '../generated/enums';
import { LogInterceptor } from '../log/log.interceptor';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

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
    console.log('Data yang masuk ke Controller:', signInDto);
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
  @UseInterceptors(LogInterceptor)
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
  @UseInterceptors(LogInterceptor)
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

  @Patch('me')
  @UseGuards(AuthGuard) // Wajib login
  @UseInterceptors(LogInterceptor)
  @UseInterceptors(
    FileInterceptor('avatar', {
      // 'avatar' adalah nama field di Postman (Body)
      // Konfigurasi Multer untuk menyimpan di disk (folder lokal)
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(process.cwd(), 'uploads/avatars');
          // Pastikan folder avatars di dalam uploads sudah kamu buat juga ya!
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          // Buat nama file unik agar tidak bentrok (misal: budi-123456789.jpg)
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      // Validasi file (Opsional tapi PENTING)
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return cb(
            new Error('Hanya file gambar (jpg, jpeg, png) yang diperbolehkan!'),
            false,
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: 1024 * 1024 * 2, // Batasi ukuran maksimal 2MB
      },
    }),
  )
  async updateMe(
    @User('username') username: string, // Ambil username dari token
    @Body() updateUserDto: UserUpdateRequest, // Ambil data teks (password)
    @UploadedFile() file: Express.Multer.File, // Ambil data file foto
  ) {
    return this.userService.update(username, updateUserDto, file);
  }
}
