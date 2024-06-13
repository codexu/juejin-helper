import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from 'src/entities/account.entity';
import { UserInfo } from 'src/entities/userinfo.entity';
import { AccountLog } from 'src/entities/accountLog.entity';
import { AccountAuthService } from './accountAuth.service';
import { AuthAdminGuard } from 'src/common/guards/authAdmin.guard';
import { BullModule } from '@nestjs/bull';
import { CheckService } from './check.service';
import { ManualService } from 'src/manual/manual.service';
import { InfoService } from './info.service';
import { UserCaptchaService } from 'src/user/userCaptcha.service';
import { ProfileService } from './profile.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'manual-queue',
    }),
    TypeOrmModule.forFeature([Account, UserInfo, AccountLog]),
    HttpModule,
  ],
  controllers: [AccountController],
  providers: [
    AccountService,
    AccountAuthService,
    ProfileService,
    AuthAdminGuard,
    CheckService,
    ManualService,
    InfoService,
    UserCaptchaService,
  ],
  exports: [AccountService, AccountAuthService],
})
export class AccountModule {}
