import { Inject, Injectable } from '@nestjs/common';
import type { CategoryId, IProductCategory } from '../domains/productCategory.domain';
import type { ProductCategoryRepository } from '../ports/productCategory.repository';
import { productCategoryRepositoryToken } from '../ports/productCategory.repository';

@Injectable()
export class GetProductCategoriesByCategoryIdUseCase {
  constructor(
    @Inject(productCategoryRepositoryToken)
    private readonly productCategoryRepository: ProductCategoryRepository,
  ) {}

  async execute({ categoryId }: { categoryId: CategoryId }): Promise<IProductCategory[]> {
    return this.productCategoryRepository.getProductCategoriesByCategoryId({ categoryId });
  }
}
