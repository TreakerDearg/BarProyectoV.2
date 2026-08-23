export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isEmployee?: boolean;
  shift?: string | null;
  permissions?: Record<string, boolean>;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
}

export interface LoginData {
  email: string;
  password: string;
}
