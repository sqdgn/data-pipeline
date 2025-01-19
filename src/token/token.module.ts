import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { GlobalToken } from './token.entity';
import { TokenService } from './token.service';
import { TopTrader } from './top.traders.entity';
import { TopHolder } from './top.holders.entity';
import { Top24hToken } from './top24.token.entity';


@Module({
    imports: [
        TypeOrmModule.forFeature([GlobalToken, TopTrader, TopHolder, Top24hToken]),
        HttpModule,
    ],
    providers: [TokenService],
    exports: [TokenService],
})
export class TokenModule {}
