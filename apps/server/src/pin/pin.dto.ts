import { ApiProperty } from '@nestjs/swagger';

export class PinsDto {
  @ApiProperty({ description: 'ids' })
  readonly ids: string[];
}
