import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommentService } from './comment.service';
import { CommentDeleteDto, CommentDto } from './comment.dto';
import { AuthAdminGuard } from 'src/common/guards/authAdmin.guard';

@ApiTags('评论管理')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  // 分页获取评论列表
  @ApiOperation({ summary: '分页获取评论列表' })
  @Get('list')
  async list(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('type') type: string,
  ) {
    const list = await this.commentService.list(page, pageSize, type);
    return {
      data: list,
      message: '获取成功',
    };
  }

  // 添加评论
  @ApiOperation({ summary: '添加评论' })
  @Post('add')
  @UseGuards(AuthAdminGuard)
  async add(@Body() comment: CommentDto) {
    const result = await this.commentService.add(comment);
    if (!result) {
      throw new Error('已存在相同的评论');
    }
    return {
      data: result,
      message: '添加成功',
    };
  }

  // 修改评论
  @ApiOperation({ summary: '修改评论' })
  @Post('update')
  @UseGuards(AuthAdminGuard)
  async update(@Body() commentDto: CommentDto) {
    const result = await this.commentService.update(
      commentDto.id,
      commentDto.content,
      commentDto.enable,
      commentDto.type,
    );
    return {
      data: result,
      message: '修改成功',
    };
  }

  // 删除评论
  @ApiOperation({ summary: '删除评论' })
  @Post('delete')
  @UseGuards(AuthAdminGuard)
  async delete(@Body() commentDeleteDto: CommentDeleteDto) {
    const result = await this.commentService.delete(commentDeleteDto.ids);
    return {
      data: result,
      message: '删除成功',
    };
  }

  // 爬虫获取评论
  @ApiOperation({ summary: '爬虫获取评论' })
  @Get('spider')
  async spider() {
    const result = await this.commentService.spider();
    return {
      data: result,
      message: '获取成功',
    };
  }
}
