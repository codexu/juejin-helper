import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Headers,
  UseGuards,
  Sse,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CookieDto,
  SetMainAccountDto,
  UpdateUserInfoDto,
  LoginSseData,
} from './user.dto';
import { AuthAdminGuard } from 'src/common/guards/authAdmin.guard';
import { UserCaptchaService } from './userCaptcha.service';
import { Observable } from 'rxjs';

@ApiTags('用户操作')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userCaptchaService: UserCaptchaService,
  ) {}

  // 使用账号密码登录，检验验证码
  @ApiOperation({ summary: '账号密码登录（自动识别验证码）' })
  @Sse('login')
  login(
    @Query('account') account: string,
    @Query('password') password: string,
    @Query('shareId') shareId?: string,
  ): Observable<LoginSseData> {
    return this.userCaptchaService.loginWithPassword(
      account,
      password,
      shareId,
    );
  }

  // 退出登录
  @ApiOperation({ summary: '用户使用 cookie 退出登录' })
  @Post('logout')
  async logout(@Body() cookieDto: CookieDto) {
    const message = await this.userService.logout(cookieDto.cookie);
    return {
      message,
    };
  }

  // 删除用户
  @ApiOperation({ summary: '删除用户' })
  @UseGuards(AuthAdminGuard)
  @Delete('delete')
  async delete(@Query('id') id: string) {
    const message = await this.userService.deleteAccount(id);
    return {
      message,
    };
  }

  // 获取用户信息
  @ApiOperation({ summary: '获取用户信息' })
  @Get('info')
  async info(@Headers() headers) {
    const cookie = headers.authorization;
    const data = await this.userService.getUserInfoByCookie(cookie);
    return {
      data,
    };
  }

  @ApiOperation({ summary: '设置主账号ID' })
  @Post('setMainAccount')
  async setMainAccount(@Body() setMainAccountDto: SetMainAccountDto) {
    const message = await this.userService.setMainAccount(
      setMainAccountDto.id,
      setMainAccountDto.mainAccount,
    );
    return {
      message,
    };
  }

  @ApiOperation({ summary: '修改账号信息' })
  @UseGuards(AuthAdminGuard)
  @Post('update')
  async update(
    @Body() updateUserInfoDto: UpdateUserInfoDto,
    @Headers() headers,
  ) {
    const cookie = headers.authorization;
    const message = await this.userService.updateUserInfo(
      cookie,
      updateUserInfoDto,
    );
    return {
      message,
    };
  }
}
