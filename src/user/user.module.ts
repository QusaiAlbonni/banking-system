import { AuthModule } from '@/auth/auth.module';
import { UserService } from '@/user/application/services/user.service';
import { forwardRef, Module } from '@nestjs/common';
import { UserInfraStructureModule } from './infrastructure/infrastructure.module';
import { AdminController } from './presenter/http/admin.controller';
import { UserController } from './presenter/http/user.controller';
import { EmailModule } from '@/email/email.module';

@Module({
  imports: [
    UserInfraStructureModule,
    forwardRef(() => AuthModule),
    EmailModule,
  ],
  controllers: [UserController, AdminController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule { }
