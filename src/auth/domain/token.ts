export class Token {
  id: number;
  userId: number;
  token: string;
  type: string;
  expiresAt: Date | null;
  revoked: boolean;
  createdAt: Date;
  updatedAt: Date;
}
