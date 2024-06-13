import { ApiProperty } from '@nestjs/swagger';

// 文章评论接口参数
export class ManualArticleCommentDto {
  @ApiProperty({ description: '文章地址' })
  readonly articleUrl: string;
  @ApiProperty({ description: '评论类型' })
  readonly type?: string;
  @ApiProperty({ description: '评论数量' })
  readonly quantity?: number;
  @ApiProperty({ description: '评论内容' })
  readonly comments?: string[];
  @ApiProperty({ description: '间隔' })
  readonly delay?: number;
}

// 文章阅读参数
export class ManualArticleReadDto {
  @ApiProperty({ description: '文章地址' })
  readonly url: string;
  @ApiProperty({ description: '阅读次数' })
  readonly quantity?: number;
  @ApiProperty({ description: '延迟' })
  readonly delay?: number;
}

// 用户文章列表阅读参数
export class ManualArticleListReadDto {
  @ApiProperty({ description: '用户文章列表地址' })
  readonly postUrl: string;
  @ApiProperty({ description: '阅读数量' })
  readonly quantity?: number;
  @ApiProperty({ description: '延迟' })
  readonly delay?: number;
}

export class ManualPinCommentDto {
  @ApiProperty({ description: '沸点地址' })
  readonly url: string;
  @ApiProperty({ description: '评论内容' })
  readonly comments: string[];
  @ApiProperty({ description: '间隔' })
  readonly delay?: number;
}
