import { TokenRepository } from '@/auth/application/ports/token.repository';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenEntity } from './entities/token.entity';
import { OrmTokenRepository } from './repositories/token.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TokenEntity])],
  providers: [
    OrmTokenRepository,
    { provide: TokenRepository, useClass: OrmTokenRepository },
  ],
  exports: [OrmTokenRepository, TokenRepository],
})
export class OrmAuthInfraStructureModule {}
