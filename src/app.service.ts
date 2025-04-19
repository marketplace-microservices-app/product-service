import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateProdcutPayload } from './types/CreateProductPayload.interface';
import { ProductEntity } from './entities/product.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(ProductEntity)
    private _productEntity: Repository<ProductEntity>,
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
}
