import { Controller, Get, Query } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StatisicDailyService } from './statisticDaily.service';

@ApiTags('统计数据')
@Controller('statistic')
export class StatisticController {
  constructor(
    private readonly statisticService: StatisticService,
    private readonly statisticDailyService: StatisicDailyService,
  ) {}

  @ApiOperation({ summary: '仪表盘获取统计数据' })
  @Get('dashboard')
  async getDashboardData(@Query('days') days: number) {
    const data = await this.statisticService.getDashboardData(days);
    return {
      data,
      message: '获取成功',
    };
  }

  @ApiOperation({ summary: '每日保存统计数据' })
  @Get('saveDailyStatisic')
  async saveDailyStatisic() {
    await this.statisticDailyService.saveDailyStatisic();
    return {
      message: '保存成功',
    };
  }
}
