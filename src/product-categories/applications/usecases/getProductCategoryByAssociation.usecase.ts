import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { CategoryId, IProductCategory, ProductId } from '../domains/productCategory.domain';
import type { ProductCategoryRepository } from '../ports/productCategory.repository';
import { productCategoryRepositoryToken } from '../ports/productCategory.repository';

@Injectable()
export class GetProductCategoryByAssociationUseCase {
  constructor(
    @Inject(productCategoryRepositoryToken)
    private readonly productCategoryRepository: ProductCategoryRepository,
  ) {}

  async execute({
    productId,
    categoryId,
  }: {
    productId: ProductId;
    categoryId: CategoryId;
  }): Promise<IProductCategory> {
    const productCategory = await this.productCategoryRepository.getProductCategoryByAssociation({
      productId,
      categoryId,
    });
    if (!productCategory) throw new NotFoundException('Product category association not found');

    return productCategory;
  }
}
