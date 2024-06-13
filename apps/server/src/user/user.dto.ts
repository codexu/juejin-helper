import { ApiProperty } from '@nestjs/swagger';

export class CookieDto {
  @ApiProperty({ description: 'cookie' })
  readonly cookie: string;
}

export class SetMainAccountDto {
  @ApiProperty({ description: '账号ID' })
  readonly id: number;
  @ApiProperty({ description: '主账号ID' })
  readonly mainAccount: string;
}

export class UpdateUserInfoDto {
  @ApiProperty({ description: '用户ID' })
  readonly id: number;
  @ApiProperty({ description: '贡献值' })
  readonly contribution: number;
  @ApiProperty({ description: '用户类型' })
  readonly type: 'admin' | 'user';
  @ApiProperty({ description: '主账号ID' })
  mainAccount?: string;
}

export type LoginSseData = {
  data: {
    message: string;
    type: string;
    data?: {
      username: string;
      userId: string;
      starNumber: number[];
      articleInfo: number[];
      pinInfo: number[];
      avatar: string;
      cookie: string;
    };
  };
};
