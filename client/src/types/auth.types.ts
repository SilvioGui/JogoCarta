export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface LoginFormData {
  identifier: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}
