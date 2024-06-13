import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PinService } from './pin.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PinsDto } from './pin.dto';

@ApiTags('沸点分析')
@Controller('pin')
export class PinController {
  constructor(private readonly pinService: PinService) {}

  @ApiOperation({ summary: '爬取沸点' })
  @Get('fetch')
  fetchPin() {
    return this.pinService.fetchPin();
  }

  @ApiOperation({ summary: '执行分析' })
  @Get('analysis')
  async getKeyword() {
    await this.pinService.getKeyword();
    return '执行分析完成';
  }

  // 统计
  @ApiOperation({ summary: '统计' })
  @Get('statistics')
  async statistics() {
    const data = await this.pinService.statistics();
    return {
      data,
    };
  }

  @ApiOperation({ summary: '获取关键词列表' })
  @Get('list')
  async getKeywordList(@Query('size') size = 20) {
    const data = await this.pinService.getKeywordList(Number(size));
    return {
      data,
    };
  }

  @ApiOperation({ summary: '屏蔽关键词' })
  @Get('block')
  async blockKeyword(
    @Query('id') id: string,
    @Query('isBlock') isBlock: string,
  ) {
    await this.pinService.blockKeyword(
      Number.parseInt(id),
      !!Number.parseInt(isBlock),
    );
    return '屏蔽关键词完成';
  }

  // 根据沸点 id 获取沸点详情
  @ApiOperation({ summary: '根据id获取详情' })
  @Get('detail')
  async getPinDetail(@Query('pinId') pinId: string) {
    const data = await this.pinService.getPinDetail(pinId);
    return {
      data,
    };
  }

  // 根据沸点 ids 获取沸点详情
  @ApiOperation({ summary: '根据ids获取详情' })
  @Post('detailList')
  async getPinDetailList(@Body() pinDto: PinsDto) {
    const data = await this.pinService.getPinDetailList(pinDto.ids);
    return {
      data,
    };
  }

  // 分页查询沸点
  @ApiOperation({ summary: '分页查询沸点' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: '页码',
    example: '1',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: '每页数量',
    example: '10',
  })
  @ApiQuery({
    name: 'isTemplate',
    required: false,
    description: '是否为模板',
    example: 'false',
  })
  @ApiQuery({
    name: 'aiReviewResult',
    required: false,
    description: 'AI 识别结果',
    example: true,
  })
  @Get('listPage')
  async listPage(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
    @Query('isTemplate') isTemplate = 'false',
    @Query('aiReviewResult') aiReviewResult = 'false',
  ) {
    const data = await this.pinService.listPage(
      Number(page),
      Number(pageSize),
      isTemplate === 'true',
      aiReviewResult === 'true',
    );
    return {
      data,
    };
  }

  // 设置沸点为模板
  @ApiOperation({ summary: '设置沸点为模板' })
  @Get('setTemplate')
  async setTemplate(
    @Query('id') id: number,
    @Query('isTemplate') isTemplate: string,
  ) {
    const pin = await this.pinService.setTemplate(
      Number(id),
      isTemplate === 'true',
    );
    return {
      data: pin,
      message: '设置模板成功',
    };
  }

  // 人工审核
  @ApiOperation({ summary: '人工审核' })
  @Get('setAiReviewResult')
  async setAiReviewResult(
    @Query('id') id: number,
    @Query('aiReviewResult') aiReviewResult: string,
  ) {
    const pin = await this.pinService.setAiReviewResult(
      Number(id),
      aiReviewResult === 'true',
    );
    return {
      data: pin,
      message: '人工审核成功',
    };
  }

  // AI 识别沸点
  @ApiOperation({ summary: 'AI 识别沸点' })
  @Get('aiReview')
  async aiReview() {
    const pin = await this.pinService.aiReview();
    return {
      data: pin,
      message: 'AI 识别沸点成功',
    };
  }
}
