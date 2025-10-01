import { Inject, Injectable } from '@nestjs/common';
import type { IProductCategory, ProductId } from '../domains/productCategory.domain';
import type { ProductCategoryRepository } from '../ports/productCategory.repository';
import { productCategoryRepositoryToken } from '../ports/productCategory.repository';

@Injectable()
export class GetProductCategoriesByProductIdUseCase {
  constructor(
    @Inject(productCategoryRepositoryToken)
    private readonly productCategoryRepository: ProductCategoryRepository,
  ) {}

  async execute({ productId }: { productId: ProductId }): Promise<IProductCategory[]> {
    return this.productCategoryRepository.getProductCategoriesByProductId({ productId });
  }
}
