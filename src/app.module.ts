import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { KafkaModule } from './kafka/kafka.module';
import { KafkaConsumerService } from './kafka/consumer.service';

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
    KafkaModule,
  ],
  controllers: [AppController],
  providers: [AppService, KafkaConsumerService],
})
export class AppModule {}
