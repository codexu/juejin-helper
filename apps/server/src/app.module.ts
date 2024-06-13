import { CacheInterceptor, CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { AutomateModule } from './automate/automate.module';
import { AccountModule } from './account/account.module';
import { TaskModule } from './task/task.module';
import { ManualModule } from './manual/manual.module';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { PinModule } from './pin/pin.module';
import { StatisticModule } from './statistic/statistic.module';
import { CommentModule } from './comment/comment.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ArticleModule } from './article/article.module';
import { RegisterModule } from './register/register.module';
import * as redisStore from 'cache-manager-redis-store';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      isGlobal: true,
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
        dateStrings: true,
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    AutomateModule,
    ManualModule,
    AccountModule,
    TaskModule,
    UserModule,
    AdminModule,
    StatisticModule,
    CommentModule,
    PinModule,
    ArticleModule,
    RegisterModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
