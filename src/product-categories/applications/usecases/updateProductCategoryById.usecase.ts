import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { type IProductCategory } from '../domains/productCategory.domain';
import type { ProductCategoryRepository } from '../ports/productCategory.repository';
import { productCategoryRepositoryToken } from '../ports/productCategory.repository';

@Injectable()
export class UpdateProductCategoryByIdUseCase {
  constructor(
    @Inject(productCategoryRepositoryToken)
    private readonly productCategoryRepository: ProductCategoryRepository,
  ) {}

  async execute(productCategory: IProductCategory): Promise<IProductCategory> {
    const existingProductCategory = await this.productCategoryRepository.getProductCategoryById({
      id: productCategory.uuid,
    });
    if (!existingProductCategory) throw new NotFoundException('Product category not found');

    return this.productCategoryRepository.updateProductCategoryById(productCategory);
  }
}
