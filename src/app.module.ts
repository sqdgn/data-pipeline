import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InterfaceSocialService } from './interface-social/interface-social.service';
import { UserModule } from './user/user.module';
import { HttpModule } from '@nestjs/axios';
import { TokenModule } from './token/token.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('DATABASE_HOST'),
                port: +configService.get('DATABASE_PORT'),
                username: configService.get('DATABASE_USER'),
                password: configService.get('DATABASE_PASSWORD'),
                database: configService.get('DATABASE_NAME'),
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
                cli: {
                    migrationsDir: 'src/migrations',
                },
                synchronize: process.env.NODE_ENV !== 'production',
                logging: process.env.NODE_ENV !== 'production',
            }),
            inject: [ConfigService],
        }),
        UserModule,
        TokenModule,
        HttpModule,
    ],
    controllers: [],
    providers: [InterfaceSocialService],
})
export class AppModule {}
