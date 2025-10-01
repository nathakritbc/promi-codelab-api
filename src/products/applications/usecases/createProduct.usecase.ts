import { Inject, Injectable } from '@nestjs/common';
import { IProduct } from '../domains/product.domain';
import type { ProductRepository } from '../ports/product.repository';
import { productRepositoryToken } from '../ports/product.repository';

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(productRepositoryToken)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(product: IProduct): Promise<IProduct> {
    return await this.productRepository.createProduct(product);
  }
}
