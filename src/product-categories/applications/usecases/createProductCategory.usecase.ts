import { Inject, Injectable } from '@nestjs/common';
import { IProductCategory } from '../domains/productCategory.domain';
import type { ProductCategoryRepository } from '../ports/productCategory.repository';
import { productCategoryRepositoryToken } from '../ports/productCategory.repository';

@Injectable()
export class CreateProductCategoryUseCase {
  constructor(
    @Inject(productCategoryRepositoryToken)
    private readonly productCategoryRepository: ProductCategoryRepository,
  ) {}

  async execute(productCategory: IProductCategory): Promise<IProductCategory> {
    return this.productCategoryRepository.createProductCategory(productCategory);
  }
}
