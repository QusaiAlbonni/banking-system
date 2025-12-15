import { UserRepository } from '@/user/application/ports/user.repository';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { OrmUserRepository } from './repositories/user.repository';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
    ]),
  ],
  providers: [
    OrmUserRepository,
    { provide: UserRepository, useClass: OrmUserRepository },
  ],
  exports: [
    OrmUserRepository,
    UserRepository,
  ],
})
export class OrmUserInfraStructureModule { }
