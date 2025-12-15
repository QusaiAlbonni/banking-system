import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

@Injectable()
export class TestGuard implements CanActivate {
  testEnv: boolean;
  debug: boolean;
  production: boolean;

  constructor(private readonly configService: ConfigService) {
    this.testEnv = this.configService.get<string>('NODE_ENV') === 'test';
    this.debug = this.configService.get<string>('DEBUG') === 'true';
    this.production =
      this.configService.get<string>('NODE_ENV') === 'production';
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (!this.testEnv) throw new NotFoundException();
    return true;
  }
}
