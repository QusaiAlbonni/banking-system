import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';

@Injectable()
export class OptionalOpaqueStrategy extends PassportStrategy(
  Strategy,
  'optional-opaque',
) {
  async validate(token: string): Promise<any> {
    throw new Error('Unimplemented.');
  }
}
