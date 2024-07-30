import { forwardRef, Module } from '@nestjs/common';
import { PetService } from './pet.service';
import { PetController } from './pet.controller';
import { PrismaService } from 'src/prisma.service';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [forwardRef(() => AuthModule), UserModule],
  controllers: [PetController],
  providers: [PetService, PrismaService],
  exports: [PetModule]
})
export class PetModule {}
