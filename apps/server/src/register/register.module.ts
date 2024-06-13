import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pin } from 'src/entities/pin.entity';
import { Keyword } from 'src/entities/keyword.entity';
import { AccountModule } from 'src/account/account.module';
import { RegisterController } from './register.controller';
import { RegisterService } from './register.service';
import { HttpModule } from '@nestjs/axios';

// 沸点分析模块
@Module({
  imports: [
    TypeOrmModule.forFeature([Pin, Keyword]),
    AccountModule,
    HttpModule,
  ],
  controllers: [RegisterController],
  providers: [RegisterService],
  exports: [RegisterService],
})
export class RegisterModule {}
