import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateProdcutPayload } from './types/CreateProductPayload.interface';
import { ProductEntity } from './entities/product.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateProdcutPayload } from './types/UpdateProductPayload.interface';
import { EachMessagePayload } from 'kafkajs';
import { KafkaConsumerService } from './kafka/consumer.service';
import { KAFKA_TOPICS } from './kafka/topic';
import CacheService from './cache.service';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(ProductEntity)
    private _productEntity: Repository<ProductEntity>,
    private readonly kafkaConsumer: KafkaConsumerService,
    private _cacheService: CacheService,
  ) {}

  async createProduct(productData: CreateProdcutPayload) {
    const {
      productCode,
      productName,
      availableStock,
      shortDesc,
      itemPrice,
      sellerId,
    } = productData;

    // Check Product Exist using Product Code
    const isProductExists = await this._productEntity.findOneBy({
      product_code: productCode,
    });

    if (isProductExists) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: `Product already exists in this marketplace`,
      };
    }

    // Create Product
    const newProduct = this._productEntity.create({
      product_code: productCode,
      product_name: productName,
      available_stock: availableStock,
      short_description: shortDesc,
      item_price: itemPrice,
      seller_id: sellerId,
    });

    const createdProduct = await this._productEntity.save(newProduct);
    return {
      status: HttpStatus.CREATED,
      message: `Product created successfully`,
      data: createdProduct,
    };
  }

  async getProductDetailsByProductId(productId: string) {
    // Check Product Exist using Product Code
    const isProductExists = await this._productEntity.findOneBy({
      id: productId,
    });

    if (!isProductExists) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: `Product not found in this marketplace`,
      };
    }

    return {
      status: HttpStatus.OK,
      message: `Product fetched successfully`,
      data: isProductExists,
    };
  }

  // Update Product
  async updateProduct(updatedProductData: UpdateProdcutPayload) {
    // Invalidate any cached data related to product list
    const keys = await this._cacheService.getMany();

    if (keys.length > 0) {
      await this._cacheService.delMany(keys);
    }

    const { id, productName, shortDesc, itemPrice, availableStock } =
      updatedProductData;

    // Check Product Exist using Product Code
    const isProductExists = await this._productEntity.findOneBy({
      id: id,
    });

    if (!isProductExists) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: `Product not found in this marketplace`,
      };
    }

    // Update only the fields that are provided
    const updatedProduct = await this._productEntity.update(id, {
      ...(productName && { product_name: productName }),
      ...(shortDesc && { short_description: shortDesc }),
      ...(itemPrice && { item_price: itemPrice }),
      ...(availableStock && { available_stock: availableStock }),
    });

    if (!updatedProduct) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Failed to update product`,
      };
    }

    return {
      status: HttpStatus.OK,
      message: `Product updated successfully`,
      data: updatedProduct,
    };
  }

  async getAllProductsPaginated(skip: number, take: number) {
    const [products, total] = await this._productEntity.findAndCount({
      skip: skip,
      take: take,
    });

    return {
      status: HttpStatus.OK,
      message: `Products fetched successfully`,
      data: products,
      total: total,
    };
  }

  async onModuleInit() {
    await this.kafkaConsumer.subscribeToTopics({
      'order.created': this.consumerOrderCreatedTopic.bind(this),
      'order.cancelled': this.consumerOrderCancelledTopic.bind(this),
    });
  }

  // Update Product on Order Created
  async consumerOrderCreatedTopic({
    topic,
    partition,
    message,
  }: EachMessagePayload) {
    const value = message.value?.toString();
    console.log(
      `[Kafka Message] Topic: ${topic} | Partition: ${partition} | Message: ${value}`,
    );

    // Invalidate any cached data related to product list
    const keys = await this._cacheService.getMany();

    if (keys.length > 0) {
      await this._cacheService.delMany(keys);
    }

    const updatedProductData = JSON.parse(value!);

    const { productId, quantity } = updatedProductData;

    // Check Product Exist using Product Code
    const isProductExists = await this._productEntity.findOneBy({
      id: productId,
    });

    if (!isProductExists) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: `Product not found in this marketplace`,
      };
    }

    // Update only the fields that are provided
    console.log(
      `Product ID: ${productId} | Quantity: ${quantity} will be deducted. Current Available stock: ${isProductExists.available_stock} => New available stock: ${isProductExists.available_stock - quantity}`,
    );
    const updatedProduct = await this._productEntity.update(
      { id: productId },
      {
        available_stock: isProductExists.available_stock - quantity,
      },
    );

    if (!updatedProduct) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Failed to update product`,
      };
    }

    return {
      status: HttpStatus.OK,
      message: `Product updated successfully`,
      data: updatedProduct,
    };
  }

  async consumerOrderCancelledTopic({
    topic,
    partition,
    message,
  }: EachMessagePayload) {
    const value = message.value?.toString();
    console.log(
      `[Kafka Message] Topic: ${topic} | Partition: ${partition} | Message: ${value}`,
    );

    // Invalidate any cached data related to product list
    const keys = await this._cacheService.getMany();

    if (keys.length > 0) {
      await this._cacheService.delMany(keys);
    }

    const updatedProductData = JSON.parse(value!);

    const { productId, quantity } = updatedProductData;

    // Check Product Exist using Product Code
    const isProductExists = await this._productEntity.findOneBy({
      id: productId,
    });

    if (!isProductExists) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: `Product not found in this marketplace`,
      };
    }

    // Update only the fields that are provided
    console.log(
      `Product ID: ${productId} | Quantity: ${quantity} will be added. Current Available stock: ${isProductExists.available_stock} => New available stock: ${isProductExists.available_stock + quantity}`,
    );
    const updatedProduct = await this._productEntity.update(
      { id: productId },
      {
        available_stock: isProductExists.available_stock + quantity,
      },
    );

    if (!updatedProduct) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Failed to update product`,
      };
    }

    return {
      status: HttpStatus.OK,
      message: `Product updated successfully`,
      data: updatedProduct,
    };
  }
}
