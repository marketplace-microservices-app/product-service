import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
