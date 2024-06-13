import { Controller, Get, Headers, Query, Sse } from '@nestjs/common';
import { TaskService } from './task.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import Bull from 'bull';

@ApiTags('任务管理')
@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  // 根据文章地址点赞文章
  @ApiOperation({ summary: '根据任务 ID 查询任务状态' })
  @Get('searchTask')
  async searchTask(@Query('taskId') taskId: string) {
    const data = await this.taskService.searchTask(taskId);
    return {
      data,
      message: '',
    };
  }

  // 查询未执行完成任务列队
  @ApiOperation({ summary: '查询未执行完成任务列队' })
  @Sse('searchUnexecutedTaskList')
  searchUnexecutedTaskList(
    @Query('authorization') authorization: string,
  ): Observable<{
    data: Bull.Job[];
  }> {
    return this.taskService.searchUnexecutedTaskList(authorization);
  }

  // 终止任务
  @ApiOperation({ summary: '终止任务' })
  @Get('stopTask')
  async stopTask(@Query('taskId') taskId: string) {
    const data = await this.taskService.stopTask(taskId);
    return {
      data,
      message: '',
    };
  }

  // 终止所有任务
  @ApiOperation({ summary: '终止所有任务' })
  @Get('stopAllTask')
  async stopAllTask(@Headers('authorization') authorization?: string) {
    const data = await this.taskService.stopAllTask(authorization);
    return {
      data,
      message: '',
    };
  }
}
