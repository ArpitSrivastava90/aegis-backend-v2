export interface JwtPayload {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
}
