import { Inject, Injectable } from '@nestjs/common';
import type { IPromotionApplicableProduct, ProductId } from '../domains/promotionApplicableProduct.domain';
import type { PromotionApplicableProductRepository } from '../ports/promotionApplicableProduct.repository';
import { promotionApplicableProductRepositoryToken } from '../ports/promotionApplicableProduct.repository';

@Injectable()
export class GetPromotionApplicableProductsByProductIdUseCase {
  constructor(
    @Inject(promotionApplicableProductRepositoryToken)
    private readonly promotionApplicableProductRepository: PromotionApplicableProductRepository,
  ) {}

  async execute({ productId }: { productId: ProductId }): Promise<IPromotionApplicableProduct[]> {
    return this.promotionApplicableProductRepository.getPromotionApplicableProductsByProductId({ productId });
  }
}
