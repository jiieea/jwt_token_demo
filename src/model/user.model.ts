export class UserRequest {
  username: string;
  password: string;
}

export class UserResponse {
  username: string;
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

export class UserLogoutResponse {
  message: string;
}

export class UserUpdateRequest {
  username?: string;
  password?: string;
  avatar?: string;
}
