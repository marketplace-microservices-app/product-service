import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { KafkaModule } from './kafka/kafka.module';
import { KafkaConsumerService } from './kafka/consumer.service';
import { RedisModule } from '@nestjs-modules/ioredis';
import CacheService from './cache.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '123',
      database: 'products',
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([ProductEntity]),
    RedisModule.forRoot({
      type: 'single',
      url: 'redis://localhost:6379',
    }),
    KafkaModule,
  ],
  controllers: [AppController],
  providers: [AppService, KafkaConsumerService, CacheService],
})
export class AppModule {}
