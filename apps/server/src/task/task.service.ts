import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Bull, { Queue } from 'bull';
import { AutomateService } from 'src/automate/automate.service';
import { Account } from 'src/entities/account.entity';
import { Repository } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { Observable, Subscriber } from 'rxjs';

@Injectable()
export class TaskService {
  constructor(
    private readonly automateService: AutomateService,
    @InjectQueue('manual-queue') private manualQueue: Queue,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  // 根据任务 ID 查询任务状态
  async searchTask(taskId: string) {
    const data = await this.manualQueue.getJob(taskId);
    if (data) {
      if (data.data.accounts) {
        data.data.usernames = data.data.accounts.map((item: Account) => {
          return item.userInfo.username;
        });
        delete data.data.accounts;
      } else {
        data.data.usernames = [data.data.account.userInfo.username];
        delete data.data.account;
      }
    }
    return data;
  }

  // 获取任务列队
  async getTaskList(account: Account) {
    // 查询账号是否是否存在
    let data = await this.manualQueue.getJobs([
      'active',
      'waiting',
      'delayed',
      'paused',
    ]);

    // 最后一个执行完毕的任务
    const lastCompletedJob = await this.manualQueue.getCompleted();

    // 插入到任务列表的第一个
    if (data && lastCompletedJob.length) {
      data.push(lastCompletedJob[0]);
    }

    if (data.length) {
      data = data.filter((item) => {
        return item.data.taskPublisher === account.id;
      });
      for (let index = 0; index < data.length; index++) {
        const jobData = data[index];
        jobData.data.usernames = jobData.data.accounts.map((item: Account) => {
          return item.userInfo.username;
        });
        jobData.data.avatars = jobData.data.accounts.map((item: Account) => {
          return item.userInfo.avatar;
        });
        delete jobData.data.accounts;
        jobData.data.taskPublisherName = account.userInfo.username;
      }
    }
    return data;
  }

  // 查询未执行完成任务列队
  searchUnexecutedTaskList(authorization: string) {
    return new Observable((observer: Subscriber<{ data: Bull.Job[] }>) => {
      (async () => {
        const account = await this.accountRepository
          .createQueryBuilder('account')
          .leftJoinAndSelect('account.userInfo', 'userInfo')
          .where('account.cookie = :cookie', { cookie: authorization })
          .getOne();

        if (!account) {
          throw new Error('账号不存在');
        }
        const data = await this.getTaskList(account);
        observer.next({ data });
        this.manualQueue.on('global:progress', async () => {
          const data = await this.getTaskList(account);
          observer.next({ data });
        });
        this.manualQueue.on('global:completed', async () => {
          const data = await this.getTaskList(account);
          observer.next({ data });
        });
        this.manualQueue.on('global:failed', async () => {
          const data = await this.getTaskList(account);
          observer.next({ data });
        });
        this.manualQueue.on('global:active', async () => {
          const data = await this.getTaskList(account);
          observer.next({ data });
        });
        this.manualQueue.on('global:waiting', async () => {
          const data = await this.getTaskList(account);
          observer.next({ data });
        });
      })();
    });
  }

  // 终止任务
  async stopTask(taskId: string) {
    const data = await this.manualQueue.getJob(taskId);
    if (data) {
      await data.remove();
    }
    return data.id;
  }

  // 终止所有任务
  async stopAllTask(authorization: string) {
    // 查询账号是否是否存在
    const account = await this.accountRepository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.userInfo', 'userInfo')
      .where('account.cookie = :cookie', { cookie: authorization })
      .getOne();

    if (!account) {
      throw new Error('账号不存在');
    }

    let data = await this.manualQueue.getJobs([
      'active',
      'waiting',
      'delayed',
      'paused',
    ]);
    if (data.length) {
      data = data.filter((item) => {
        return item.data.taskPublisher === account.id;
      });
      for (let index = 0; index < data.length; index++) {
        const jobData = data[index];
        await jobData.remove();
      }
    }
    return data.map((item) => {
      return item.id;
    });
  }
}
