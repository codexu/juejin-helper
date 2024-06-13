import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { AccountLog } from 'src/entities/accountLog.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@EventSubscriber()
export class AccountLogSubscriber
  implements EntitySubscriberInterface<AccountLog>
{
  constructor(
    dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return AccountLog;
  }

  afterInsert(event: InsertEvent<AccountLog>) {
    setTimeout(() => {
      this.eventEmitter.emit('log.insert', event.entity);
    }, 10);
  }
}
