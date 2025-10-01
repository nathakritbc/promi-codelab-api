import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type {
  IPromotionApplicableProduct,
  PromotionApplicableProductId,
} from '../domains/promotionApplicableProduct.domain';
import type { PromotionApplicableProductRepository } from '../ports/promotionApplicableProduct.repository';
import { promotionApplicableProductRepositoryToken } from '../ports/promotionApplicableProduct.repository';

@Injectable()
export class GetPromotionApplicableProductByIdUseCase {
  constructor(
    @Inject(promotionApplicableProductRepositoryToken)
    private readonly promotionApplicableProductRepository: PromotionApplicableProductRepository,
  ) {}

  async execute({ id }: { id: PromotionApplicableProductId }): Promise<IPromotionApplicableProduct> {
    const promotionApplicableProduct =
      await this.promotionApplicableProductRepository.getPromotionApplicableProductById({ id });
    if (!promotionApplicableProduct) throw new NotFoundException('Promotion applicable product not found');

    return promotionApplicableProduct;
  }
}
