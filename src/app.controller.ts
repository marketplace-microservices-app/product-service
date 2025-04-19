import { Controller, Get, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateProdcutPayload } from './types/CreateProductPayload.interface';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('api/product')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('product.create')
  @Post('create')
  createProduct(@Payload() productData: CreateProdcutPayload) {
    return this.appService.createProduct(productData);
  }

  @MessagePattern('product.get-all-paginated')
  @Get('get-all-products/paginated')
  getAllProductsPaginated(
    @Query('skip') skip: string,
    @Query('take') take: string,
  ) {
    return this.appService.getAllProductsPaginated(Number(skip), Number(take));
  }
}
