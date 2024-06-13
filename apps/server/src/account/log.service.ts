import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Account } from 'src/entities/account.entity';
import { UserInfo } from 'src/entities/userinfo.entity';
import { AccountLog } from 'src/entities/accountLog.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { fromEvent, mergeMap, startWith } from 'rxjs';

export interface AccountLogData {
  data: {
    records: AccountLog[];
    page: number;
    total: number;
    pageSize: number;
  };
}

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(AccountLog)
    private readonly accountLogsRepository: Repository<AccountLog>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // 分页获取日志，account 关联 userInfo
  async getAccountLog(page = 1, pageSize = 10, type: string) {
    const [data, total] = await this.accountLogsRepository
      .createQueryBuilder('accountLog')
      .leftJoinAndSelect('accountLog.account', 'account')
      .leftJoinAndSelect('account.userInfo', 'userInfo')
      .where(type ? 'accountLog.type = :type' : '1=1', { type })
      .orderBy('accountLog.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    const records = data.map((log: AccountLog) => {
      const account = log.account as unknown as Account;
      const userInfo = account.userInfo as unknown as UserInfo;
      const result = Object.assign({}, log, {
        username: userInfo.username,
        userId: userInfo.userId,
        avatar: userInfo.avatar,
      });
      delete result.account;
      return result;
    });

    console.log(records);

    return {
      records: records,
      page,
      total,
      pageSize,
    };
  }

  onLogInsert(page = 1, pageSize = 10, type: string) {
    return fromEvent(this.eventEmitter, 'log.insert').pipe(
      startWith(null),
      mergeMap(async () => {
        return {
          data: await this.getAccountLog(page, pageSize, type),
        };
      }),
    );
  }

  // 已读日志
  async readLog(ids: string[]) {
    return this.accountLogsRepository.update({ id: In(ids) }, { isRead: true });
  }
}
