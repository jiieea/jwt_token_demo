export class UserRequest {
  username: string;
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
