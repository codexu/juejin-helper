import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Pin } from '../entities/pin.entity';
import { Keyword } from '../entities/keyword.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

let count = 0;

const blackPhone = ['13196465084', '15570913268'];

@Injectable()
export class RegisterService {
  constructor(
    @InjectRepository(Pin)
    private readonly pinRepository: Repository<Pin>,
    @InjectRepository(Keyword)
    private readonly keywordRepository: Repository<Keyword>,
    private readonly httpService: HttpService,
  ) {}

  async login(): Promise<any> {
    const user = '15711379055';
    const password = 'lixu1234';
    const { data } = await firstValueFrom(
      this.httpService.get('http://api.eejiema.com/zc/data.php', {
        params: {
          code: 'login',
          user,
          password,
        },
      }),
    );
    return data;
  }

  async getPhone(token: string): Promise<any> {
    count += 1;
    const cardType = '实卡';
    const { data } = await firstValueFrom(
      this.httpService.get('http://api.eejiema.com/zc/data.php', {
        params: {
          code: 'getPhone',
          token,
          cardType,
        },
      }),
    );
    const blackList = ['16', '17', '19'];
    const isBlack = blackList.includes(`${data}`.substring(0, 2));
    if (isBlack || blackPhone.includes(`${data}`)) {
      this.getPhone(token);
      blackPhone.push(data);
    } else {
      return data;
    }
  }
}
