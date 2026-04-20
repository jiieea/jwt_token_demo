import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import express from 'express';
import { UserService } from './user.service';
import { extname, join } from 'path';
import {
  AvatarPath,
  UserSearchRequest,
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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import * as fs from 'fs';
import * as client from '../generated/client';
import { avatarStorage, imageFilter } from '../../uploads/upload.config';

@ApiTags('User')
@Controller('/user')
@UseInterceptors(LogInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('/avatar/:filename')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN)
  getAvatar(@Res() res: any, @Param('filename') filename: string) {
    const file = join(process.cwd(), 'uploads/avatars', filename);
    if (!fs.existsSync(file)) {
      return res.send(`File Not Found`);
    }
    return res.sendFile(file);
  }
  @UseGuards(AuthGuard)
  @Get('/profile')
  getProfile(@User('username') user) {
    return {
      message: 'Ini data profil kamu',
      user: user,
    };
  }

  @Post('/profile')
  @UseGuards(AuthGuard)
  async deleteAvatar(@User('username') user: string) {
    return this.userService.deleteAvatar(user);
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
      storage: avatarStorage,
      // Validasi file (Opsional tapi PENTING)
      fileFilter: imageFilter,
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

  @Get('/search')
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
