import { Controller, Get, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateProdcutPayload } from './types/CreateProductPayload.interface';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UpdateProdcutPayload } from './types/UpdateProductPayload.interface';

@Controller('api/product')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('product.create')
  @Post('create')
  createProduct(@Payload() productData: CreateProdcutPayload) {
    return this.appService.createProduct(productData);
  }

  @MessagePattern('product.get-product-details-by-productId')
  @Post('get-product-details-by-productId')
  getProductDetailsByProductId(@Payload() productId: string) {
    return this.appService.getProductDetailsByProductId(productId);
  }

  @MessagePattern('product.get-all-paginated')
  @Get('get-all-products/paginated')
  getAllProductsPaginated(@Payload() payload: { skip: number; take: number }) {
    return this.appService.getAllProductsPaginated(payload.skip, payload.take);
  }

  @MessagePattern('product.update')
  @Post('update')
  update(@Payload() updatedProductData: UpdateProdcutPayload) {
    return this.appService.updateProduct(updatedProductData);
  }

  @MessagePattern('product.get-all-products-by-sellerId')
  @Post('get-all-products-by-sellerId')
  getAllProductsBySellerId(@Payload() sellerId: string) {
    return this.appService.getAllProductsBySellerId(sellerId);
  }
}
