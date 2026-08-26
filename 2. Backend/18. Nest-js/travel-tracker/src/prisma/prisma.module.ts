import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

//makes the module as globally scoped
@Global()
@Module({
  //registering prisma service in this module
  providers: [PrismaService],

  //making sure that this PrismaService is available to other modules that will import PrismaModule
  exports: [PrismaService],
})
export class PrismaModule {}
