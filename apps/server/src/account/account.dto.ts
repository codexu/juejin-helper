import { ApiProperty } from '@nestjs/swagger';

export class ReadLogDto {
  @ApiProperty({ description: 'ID 列表' })
  readonly ids: string[];
}
