import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { Trade } from './trade.entity';
import { ActivityEntity } from './activity.entity';
import { Queue } from './queue.entity';
import { Tweet } from './tweet.entity';
import { InterfaceSocialService } from '../interface-social/interface-social.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Trade, ActivityEntity, Queue, Tweet]),
    HttpModule,
  ],
  providers: [UserService, InterfaceSocialService],
  exports: [UserService, InterfaceSocialService],
})
export class UserModule {}

