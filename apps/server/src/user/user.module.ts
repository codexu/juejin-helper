import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from 'src/entities/account.entity';
import { UserInfo } from 'src/entities/userinfo.entity';
import { UserEventsGateway } from './user.events.gateway';
import { AccountLog } from 'src/entities/accountLog.entity';
import { AccountModule } from 'src/account/account.module';
import { UserCaptchaService } from './userCaptcha.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, UserInfo, AccountLog]),
    AccountModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserCaptchaService, UserEventsGateway],
  exports: [UserService],
})
export class UserModule {}
