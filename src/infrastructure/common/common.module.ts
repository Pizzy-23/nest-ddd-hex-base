import { Global, Module } from '@nestjs/common';
import { DomainEventsPublisher } from '../../domain/domain-events/domain-events-publisher';
import { DomainEventsStore } from '../../domain/domain-events/domain-events-store';
import { DomainEventsSubscriber } from '../../domain/domain-events/domain-events-subscriber';

@Global()
@Module({
  providers: [DomainEventsPublisher, DomainEventsStore, DomainEventsSubscriber],
})
export class SharedModule {}
