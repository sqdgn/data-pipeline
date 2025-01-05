import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { Trade } from './trade.entity';
import { ActivityEntity } from './activity.entity';

import { InterfaceSocialService } from '../interface-social/interface-social.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Trade, ActivityEntity]),
    HttpModule,
  ],
  providers: [UserService, InterfaceSocialService],
  exports: [UserService, InterfaceSocialService],
})
export class UserModule {}

