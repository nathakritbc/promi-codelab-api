import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ProductId } from '../domains/product.domain';
import type { ProductRepository } from '../ports/product.repository';
import { productRepositoryToken } from '../ports/product.repository';

@Injectable()
export class DeleteProductByIdUseCase {
  constructor(
    @Inject(productRepositoryToken)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute({ id }: { id: ProductId }): Promise<void> {
    const productFound = await this.productRepository.getProductById({ id });
    if (!productFound) throw new NotFoundException('Product not found');
    return this.productRepository.deleteProductById({ id });
  }
}
