import { Module } from '@nestjs/common';
import { OrmUserInfraStructureModule } from './orm/orm.module';

@Module({
  imports: [OrmUserInfraStructureModule],
  exports: [OrmUserInfraStructureModule],
})
export class UserInfraStructureModule {}
