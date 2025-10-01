import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { PromotionApplicableProductId } from '../domains/promotionApplicableProduct.domain';
import type { PromotionApplicableProductRepository } from '../ports/promotionApplicableProduct.repository';
import { promotionApplicableProductRepositoryToken } from '../ports/promotionApplicableProduct.repository';

@Injectable()
export class DeletePromotionApplicableProductByIdUseCase {
  constructor(
    @Inject(promotionApplicableProductRepositoryToken)
    private readonly promotionApplicableProductRepository: PromotionApplicableProductRepository,
  ) {}

  async execute({ id }: { id: PromotionApplicableProductId }): Promise<void> {
    const promotionApplicableProductFound =
      await this.promotionApplicableProductRepository.getPromotionApplicableProductById({ id });
    if (!promotionApplicableProductFound) throw new NotFoundException('Promotion applicable product not found');
    return this.promotionApplicableProductRepository.deletePromotionApplicableProductById({ id });
  }
}
