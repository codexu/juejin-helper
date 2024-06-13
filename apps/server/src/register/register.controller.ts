import { Controller, Get, Query } from '@nestjs/common';
import { RegisterService } from './register.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('注册')
@Controller('register')
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}

  @ApiOperation({ summary: '登录' })
  @Get('login')
  async login() {
    const data = await this.registerService.login();
    return {
      data,
    };
  }

  @ApiOperation({ summary: '获取手机号' })
  @Get('getPhone')
  async getPhone(@Query('token') token: string) {
    const data = await this.registerService.getPhone(token);
    return {
      data,
    };
  }
}
