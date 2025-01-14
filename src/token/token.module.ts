import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { GlobalToken } from './token.entity';
import { TokenService } from './token.service';


@Module({
    imports: [
        TypeOrmModule.forFeature([GlobalToken]),
        HttpModule,
    ],
    providers: [TokenService],
    exports: [TokenService],
})
export class TokenModule {}
