export interface JwtAccessPayload {
  sub: string;
  email: string;
  type: "access";
}

export interface JwtRefreshPayload {
  sub: string;
  email: string;
  type: "refresh";
  jti: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserSafe {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
