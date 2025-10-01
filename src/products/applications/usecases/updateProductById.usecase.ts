import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { type IProduct } from '../domains/product.domain';
import type { ProductRepository } from '../ports/product.repository';
import { productRepositoryToken } from '../ports/product.repository';

@Injectable()
export class UpdateProductByIdUseCase {
  constructor(
    @Inject(productRepositoryToken)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(product: IProduct): Promise<IProduct> {
    const existingProduct = await this.productRepository.getProductById({ id: product.uuid });
    if (!existingProduct) throw new NotFoundException('Product not found');

    return this.productRepository.updateProductById(product);
  }
}
