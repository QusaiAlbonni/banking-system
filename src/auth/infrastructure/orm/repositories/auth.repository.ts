import { AuthRepository } from '@/auth/application/ports/auth.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OrmAuthRepostiory extends AuthRepository {
  login(email: string, password: string) {
    throw new Error('Method not implemented.');
  }
  constructor() {
    super();
  }
}
