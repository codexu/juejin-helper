import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from 'src/entities/account.entity';
import { UserInfo } from 'src/entities/userinfo.entity';
import { AccountLog } from 'src/entities/accountLog.entity';
import { UpdateUserInfoDto } from './user.dto';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(UserInfo)
    private readonly userInfoRepository: Repository<UserInfo>,
    @InjectRepository(AccountLog)
    private readonly accountLogRepository: Repository<AccountLog>,
  ) {}

  // 用户使用 cookie 退出登录
  async logout(cookie: string) {
    // 根据 cookie 删除用户信息，并且删除 userInfo 表中的数据
    const account = await this.accountRepository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.userInfo', 'userInfo')
      .where('account.cookie = :cookie', { cookie })
      .getOne();
    if (account) {
      account.cookie = '';
      await this.accountRepository.save(account);
      return '用户退出登录成功';
    }
    return '未查询到已登录的用户';
  }

  // 删除用户
  async deleteAccount(id: string) {
    // 删除 type 为 user 的账号，同时删除 userInfo 表中的数据，确保 userId 存在时才删除
    const account = await this.accountRepository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.userInfo', 'userInfo')
      .where('account.id = :id', { id })
      .andWhere('account.type = :type', { type: 'user' })
      .getOne();
    if (account) {
      // 强制删除 account 和与其关联的数据
      await this.accountLogRepository.delete({ account: account.id });
      await this.accountRepository.remove(account);
      await this.userInfoRepository.remove(account.userInfo);
      return '用户删除成功';
    }
    return '未查询到该用户';
  }

  // 通过 cookie 查询到用户的信息
  async getUserInfoByCookie(cookie: string) {
    const account = await this.accountRepository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.userInfo', 'userInfo')
      .where('account.cookie = :cookie', { cookie })
      .getOne();
    if (account) {
      return {
        id: account.id,
        type: account.type,
        mainAccount: account.mainAccount,
        ...account.userInfo,
      };
    }
    return null;
  }

  // 设置用户的主账号
  async setMainAccount(id: number, mainAccount: string) {
    const account = await this.accountRepository
      .createQueryBuilder('account')
      .where('account.id = :id', { id })
      .getOne();
    if (account) {
      account.mainAccount = mainAccount;
      await this.accountRepository.save(account);
      return '设置主账号成功';
    }
    return '未查询到该用户';
  }

  // 更新用户信息
  async updateUserInfo(cookie: string, updateUserInfoDto: UpdateUserInfoDto) {
    const account = await this.accountRepository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.userInfo', 'userInfo')
      .where('account.id = :id', { id: updateUserInfoDto.id })
      .getOne();
    if (account) {
      account.type = updateUserInfoDto.type;
      account.userInfo.contribution = updateUserInfoDto.contribution;
      if (updateUserInfoDto.mainAccount) {
        account.mainAccount = updateUserInfoDto.mainAccount;
      }
      await this.accountRepository.save(account);
      return '更新用户信息成功';
    }
    return '未查询到该用户';
  }
}
