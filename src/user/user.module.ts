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
import { Token } from './token.entity';
import { TokenModule } from '../token/token.module';
import { TokenPosition } from './token.position.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Trade, ActivityEntity, Queue, Tweet, Token, TokenPosition]),
        HttpModule,
        TokenModule,
    ],
    providers: [UserService, InterfaceSocialService],
    exports: [UserService, InterfaceSocialService],
})
export class UserModule {}
