import { ApiProperty } from '@nestjs/swagger';

export class CommentDto {
  @ApiProperty({ description: '评论ID' })
  readonly id: number;
  @ApiProperty({ description: '评论内容' })
  readonly content: string;
  @ApiProperty({ description: '是否启用' })
  readonly enable: boolean;
  @ApiProperty({ description: '类型' })
  readonly type: string;
}

export class CommentDeleteDto {
  @ApiProperty({ description: '评论ID列表' })
  readonly ids: number[];
}
