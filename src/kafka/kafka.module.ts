import { Module } from '@nestjs/common';
import { KafkaConsumerService } from './consumer.service';

@Module({
  controllers: [],
  providers: [KafkaConsumerService],
})
export class KafkaModule {}
