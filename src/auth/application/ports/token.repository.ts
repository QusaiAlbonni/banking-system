import { Token } from '@/auth/domain/token';

export abstract class TokenRepository {
  abstract create(
    userId: number,
    token: string,
    type: string,
    expiresAt: Date | null,
  );
  abstract findByToken(token: string): Promise<Token | null>;
  abstract findByUserId(userId: number): Promise<Token[]>;
  abstract revokeToken(id: number): Promise<void>;
  abstract revokeTokensForUser(userId: number, type: string): Promise<void>;
  abstract deleteExpiredTokens(): Promise<void>;
}
