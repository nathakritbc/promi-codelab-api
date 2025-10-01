import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IProduct, ProductId } from '../domains/product.domain';
import type { ProductRepository } from '../ports/product.repository';
import { productRepositoryToken } from '../ports/product.repository';

@Injectable()
export class GetProductByIdUseCase {
  constructor(
    @Inject(productRepositoryToken)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute({ id }: { id: ProductId }): Promise<IProduct> {
    const product = await this.productRepository.getProductById({ id });
    if (!product) throw new NotFoundException('Product not found');

    return product;
  }
}
