import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Account } from 'src/entities/account.entity';

@Injectable()
export class AccountAuthService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  // 根据 cookie 查询用户信息
  async getAccountInfo(cookie: string) {
    const accounts = await this.accountRepository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.userInfo', 'userInfo')
      .where('account.cookie = :cookie', { cookie })
      .getOne();
    return accounts;
  }
}
