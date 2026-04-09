export interface UserRow {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  is_active: number;
  is_banned: number;
  ban_reason: string | null;
}

export interface PublicUser {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;
  username: string;
  iat: number;
  exp: number;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  identifier: string; // email ou username
  password: string;
}
