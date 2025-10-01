import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IProductCategory, ProductCategoryId } from '../domains/productCategory.domain';
import type { ProductCategoryRepository } from '../ports/productCategory.repository';
import { productCategoryRepositoryToken } from '../ports/productCategory.repository';

@Injectable()
export class GetProductCategoryByIdUseCase {
  constructor(
    @Inject(productCategoryRepositoryToken)
    private readonly productCategoryRepository: ProductCategoryRepository,
  ) {}

  async execute({ id }: { id: ProductCategoryId }): Promise<IProductCategory> {
    const productCategory = await this.productCategoryRepository.getProductCategoryById({ id });
    if (!productCategory) throw new NotFoundException('Product category not found');

    return productCategory;
  }
}
