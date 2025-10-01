import { Inject, Injectable } from '@nestjs/common';
import type {
  GetAllProductCategoriesQuery,
  GetAllProductCategoriesReturnType,
  ProductCategoryRepository,
} from '../ports/productCategory.repository';
import { productCategoryRepositoryToken } from '../ports/productCategory.repository';

@Injectable()
export class GetAllProductCategoriesUseCase {
  constructor(
    @Inject(productCategoryRepositoryToken)
    private readonly productCategoryRepository: ProductCategoryRepository,
  ) {}

  async execute(params: GetAllProductCategoriesQuery): Promise<GetAllProductCategoriesReturnType> {
    return this.productCategoryRepository.getAllProductCategories(params);
  }
}
