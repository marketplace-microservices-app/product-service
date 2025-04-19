import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Consumer, EachMessagePayload, Kafka, KafkaConfig } from 'kafkajs';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private consumer: Consumer;

  constructor() {
    const config: KafkaConfig = {
      clientId: 'order-created-topic-consumer',
      brokers: ['localhost:9092'],
    };

    this.kafka = new Kafka(config);
    this.consumer = this.kafka.consumer({
      groupId: 'order-created-topic-consumer-group',
    });
  }

  async onModuleInit() {
    await this.consumer.connect();
    console.log('Product Service : Kafka Consumer Connected');
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
    console.log('Product Service : Kafka Consumer Disconnected');
  }

  async subscribeToTopic(
    topic: string,
    onMessage: (payload: EachMessagePayload) => Promise<void>,
  ) {
    await this.consumer.subscribe({ topic, fromBeginning: true });

    await this.consumer.run({
      eachMessage: async (payload) => {
        try {
          await onMessage(payload);
        } catch (error) {
          console.error(
            `Product Service : Kafka Consumer Error in message handler: ${error}`,
          );
        }
      },
    });

    console.log(
      `Product Service : Kafka Consumer Subscribed to topic: ${topic}`,
    );
  }
}
