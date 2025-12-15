import { UserModule } from '@/user/user.module';
import { forwardRef, Module } from '@nestjs/common';

@Module({
  imports: [forwardRef(() => UserModule)],
  // exports: [UserModule],
})
export class CreateAdminModule {}
