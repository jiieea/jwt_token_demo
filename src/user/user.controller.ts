import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { extname, join } from 'path';
import { UserSearchRequest, UserUpdateRequest } from '../model/user.model';
import { AuthGuard } from '../auth/guards/auth.guard';
import { User } from '../auth/decorators/auth.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLE } from '../generated/enums';
import { LogInterceptor } from '../log/log.interceptor';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ApiOperation, ApiTags } from '@nestjs/swagger';


@ApiTags('User')
@UseInterceptors(LogInterceptor)
@Controller('/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get('/profile')
  getProfile(@User('username') user) {
    return {
      message: 'Ini data profil kamu',
      user: user,
    };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN)
  @Delete('/:username')
  @ApiOperation({ summary: 'Kick Unauthorized User' })
  deleteUser(@Param('username') username: string) {
    return `User ${username} berhasil dihapus oleh Admin`;
  }

  @Get('/users')
  @UseGuards(AuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get all users' })
  @Roles(ROLE.ADMIN)
  async getUsers(
    @Query('size', ParseIntPipe) size: number,
    @Query('page', ParseIntPipe) page: number,
  ) {
    const users = await this.userService.findAll(page, size);
    return {
      success: true,
      data: users,
    };
  }

  @Patch('me')
  @UseGuards(AuthGuard) // Wajib login
  @ApiOperation({ summary: 'Update user profile' })
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

  @Get('')
  @HttpCode(200)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN)
  @ApiOperation({ summary: 'Search Users' })
  async searchUsers(
    @Query() search: UserSearchRequest,
    @Query('size', ParseIntPipe) size: number,
    @Query('page', ParseIntPipe) page: number,
  ) {
    return this.userService.search(search, size, page);
  }
}
