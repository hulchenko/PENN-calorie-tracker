export interface Session {
  user: SessionUser;
  user_id: string;
  expiresAt: string;
  iat: number;
  exp: number;
}

export interface SessionUser {
  user_id: string;
  name: string;
  email: string;
}
