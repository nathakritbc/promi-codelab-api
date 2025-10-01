import { Inject, Injectable } from '@nestjs/common';
import type { GetAllProductsQuery, GetAllProductsReturnType, ProductRepository } from '../ports/product.repository';
import { productRepositoryToken } from '../ports/product.repository';

@Injectable()
export class GetAllProductsUseCase {
  constructor(
    @Inject(productRepositoryToken)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(params: GetAllProductsQuery): Promise<GetAllProductsReturnType> {
    return this.productRepository.getAllProducts(params);
  }
}
