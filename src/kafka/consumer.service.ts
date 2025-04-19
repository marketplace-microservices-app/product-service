import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Consumer, EachMessagePayload, Kafka, KafkaConfig } from 'kafkajs';

type TopicHandlerMap = {
  [topic: string]: (payload: EachMessagePayload) => Promise<void>;
};

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private consumer: Consumer;
  private topicHandlers: TopicHandlerMap = {};

  constructor() {
    const config: KafkaConfig = {
      clientId: 'product-service-consumer',
      brokers: ['localhost:9092'],
    };

    this.kafka = new Kafka(config);
    this.consumer = this.kafka.consumer({
      groupId: 'product-service-consumer-group',
    });
  }

  async onModuleInit() {
    await this.consumer.connect();
    console.log('Product Service : Kafka Consumer Connected');
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
    console.log(
      'Product Service : Kafka Consumer Disconnected (Product Service)',
    );
  }

  async subscribeToTopics(topicHandlers: TopicHandlerMap) {
    this.topicHandlers = topicHandlers;

    for (const topic of Object.keys(topicHandlers)) {
      await this.consumer.subscribe({ topic, fromBeginning: false });
      console.log(`Subscribed to topic: ${topic}`);
    }

    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        const topic = payload.topic;
        const handler = this.topicHandlers[topic];

        if (handler) {
          try {
            await handler(payload);
          } catch (error) {
            console.error(
              `Product Service : Kafka Error Topic: ${topic} | Error: ${error}`,
            );
          }
        } else {
          console.warn(
            `Product Service : Kafka Warning No handler found for topic: ${topic}`,
          );
        }
      },
    });
  }
}
