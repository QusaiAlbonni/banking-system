import { Module } from '@nestjs/common';
import { OrmAuthInfraStructureModule } from './orm/orm.module';

@Module({
  imports: [OrmAuthInfraStructureModule],
  exports: [OrmAuthInfraStructureModule],
})
export class AuthInfraStructureModule {}
