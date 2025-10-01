import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IPromotionApplicableProduct, ProductId, PromotionId } from '../domains/promotionApplicableProduct.domain';
import type { PromotionApplicableProductRepository } from '../ports/promotionApplicableProduct.repository';
import { promotionApplicableProductRepositoryToken } from '../ports/promotionApplicableProduct.repository';

@Injectable()
export class GetPromotionApplicableProductByAssociationUseCase {
  constructor(
    @Inject(promotionApplicableProductRepositoryToken)
    private readonly promotionApplicableProductRepository: PromotionApplicableProductRepository,
  ) {}

  async execute({
    promotionId,
    productId,
  }: {
    promotionId: PromotionId;
    productId: ProductId;
  }): Promise<IPromotionApplicableProduct> {
    const promotionApplicableProduct =
      await this.promotionApplicableProductRepository.getPromotionApplicableProductByAssociation({
        promotionId,
        productId,
      });
    if (!promotionApplicableProduct) throw new NotFoundException('Promotion applicable product association not found');

    return promotionApplicableProduct;
  }
}
