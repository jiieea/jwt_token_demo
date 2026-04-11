import { ApiProperty } from '@nestjs/swagger';

export class UserRequest {
  @ApiProperty({ example: 'Users', description: 'Username user' })
  username: string;
  @ApiProperty({ example: 'secret123', description: 'Password user' })
  password: string;
}

export class UserResponse {
  username: string;
  role?: string;
}

export class UserLoginRequest {
  username: string;
  password: string;
}

export class UserLoginResponse {
  username: string;
  message: string;
  token: string;
}

export class UserSearchRequest {
  search?: string;
}

export class UserUpdateRequest {
  username?: string;
  password?: string;
  avatar?: string;
}
