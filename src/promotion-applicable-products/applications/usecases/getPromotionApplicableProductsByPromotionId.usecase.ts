import { Inject, Injectable } from '@nestjs/common';
import type { IPromotionApplicableProduct, PromotionId } from '../domains/promotionApplicableProduct.domain';
import type { PromotionApplicableProductRepository } from '../ports/promotionApplicableProduct.repository';
import { promotionApplicableProductRepositoryToken } from '../ports/promotionApplicableProduct.repository';

@Injectable()
export class GetPromotionApplicableProductsByPromotionIdUseCase {
  constructor(
    @Inject(promotionApplicableProductRepositoryToken)
    private readonly promotionApplicableProductRepository: PromotionApplicableProductRepository,
  ) {}

  async execute({ promotionId }: { promotionId: PromotionId }): Promise<IPromotionApplicableProduct[]> {
    return this.promotionApplicableProductRepository.getPromotionApplicableProductsByPromotionId({ promotionId });
  }
}
