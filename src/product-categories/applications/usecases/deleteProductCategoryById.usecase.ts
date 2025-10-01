import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ProductCategoryId } from '../domains/productCategory.domain';
import type { ProductCategoryRepository } from '../ports/productCategory.repository';
import { productCategoryRepositoryToken } from '../ports/productCategory.repository';

@Injectable()
export class DeleteProductCategoryByIdUseCase {
  constructor(
    @Inject(productCategoryRepositoryToken)
    private readonly productCategoryRepository: ProductCategoryRepository,
  ) {}

  async execute({ id }: { id: ProductCategoryId }): Promise<void> {
    const productCategoryFound = await this.productCategoryRepository.getProductCategoryById({ id });
    if (!productCategoryFound) throw new NotFoundException('Product category not found');
    return this.productCategoryRepository.deleteProductCategoryById({ id });
  }
}
