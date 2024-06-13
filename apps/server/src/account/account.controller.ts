import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Headers,
  Sse,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { AccountService } from './account.service';
import { ReadLogDto } from './account.dto';
import { AuthAdminGuard } from 'src/common/guards/authAdmin.guard';
import { CheckService } from './check.service';
import { InfoService } from './info.service';
import { ProfileService } from './profile.service';
import { LogService } from './log.service';

@ApiTags('账号管理')
@Controller('account')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly checkService: CheckService,
    private readonly profileService: ProfileService,
    private readonly infoService: InfoService,
    private readonly logService: LogService,
  ) {}

  @ApiOperation({ summary: '单独访问账号（本地服务）' })
  @Get('visitAccount')
  async visitAccount(@Query('id') id: number) {
    const data = await this.accountService.visitAccount(id);
    return {
      data,
      message: '访问成功',
    };
  }

  @ApiOperation({ summary: '查询所有账号的信息' })
  @Get('findAll')
  async findAll(
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
  ) {
    const data = await this.accountService.findAllWithUserInfo(
      Number.parseInt(page),
      Number.parseInt(pageSize),
    );
    return {
      data,
      message: '查询成功',
    };
  }

  @ApiOperation({ summary: '查询消息' })
  @Get('findMessage')
  async findMessage(@Query('id') id: string) {
    const data = await this.accountService.findMessage(Number.parseInt(id));
    return {
      data,
      message: '查询成功',
    };
  }

  @ApiOperation({ summary: '检测未登录账号' })
  @Get('getCookie')
  getCookie() {
    this.accountService.getCookie();
    return {
      message: '已启动手动登录，等待登录成功后自动关闭',
    };
  }

  @ApiOperation({ summary: '检测 cookie 是否过期' })
  @Get('checkCookie')
  @UseGuards(AuthAdminGuard)
  async checkCookie(@Headers('authorization') authorization: string) {
    this.checkService.checkCookie(authorization);
    return {
      message: '开始检测',
    };
  }

  @ApiOperation({ summary: '更新全部账号信息' })
  @Get('queryAccountInformation')
  @UseGuards(AuthAdminGuard)
  queryAccountInformation() {
    this.infoService.queryInfo();
    return {
      message: '已启动',
    };
  }

  @ApiOperation({ summary: '查询日志信息' })
  @Sse('accountLog')
  // 分页获取日志
  accountLog(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('type') type: string,
  ) {
    return this.logService.onLogInsert(page, pageSize, type);
  }

  @ApiOperation({ summary: '已读日志' })
  @Post('readLog')
  @ApiBody({ type: ReadLogDto })
  async readLog(@Body() readLogDto: ReadLogDto) {
    const data = await this.logService.readLog(readLogDto.ids);
    return {
      data,
      message: '已读成功',
    };
  }

  // 将 json 账号导入数据库
  @ApiOperation({ summary: '导入账号' })
  @Post('importAccount')
  async importAccount(@Body() body: any) {
    const data = this.accountService.importAccount(body);
    return {
      data,
      message: '开始导入',
    };
  }

  @ApiOperation({ summary: '修改所有账号用户名' })
  @Get('changeUserName')
  async changeUserName() {
    this.profileService.changeUserName();
    return {
      message: '开始修改',
    };
  }

  @ApiOperation({ summary: '根据 id 修改用户信息' })
  @Get('changeProfileById')
  async changeProfileById(@Query('id') id: number) {
    this.profileService.changeProfileById(id);
    return {
      message: '开始修改',
    };
  }
}
