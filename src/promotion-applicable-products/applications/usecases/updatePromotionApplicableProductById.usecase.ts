import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { type IPromotionApplicableProduct } from '../domains/promotionApplicableProduct.domain';
import type { PromotionApplicableProductRepository } from '../ports/promotionApplicableProduct.repository';
import { promotionApplicableProductRepositoryToken } from '../ports/promotionApplicableProduct.repository';

@Injectable()
export class UpdatePromotionApplicableProductByIdUseCase {
  constructor(
    @Inject(promotionApplicableProductRepositoryToken)
    private readonly promotionApplicableProductRepository: PromotionApplicableProductRepository,
  ) {}

  async execute(promotionApplicableProduct: IPromotionApplicableProduct): Promise<IPromotionApplicableProduct> {
    const existingPromotionApplicableProduct =
      await this.promotionApplicableProductRepository.getPromotionApplicableProductById({
        id: promotionApplicableProduct.uuid,
      });
    if (!existingPromotionApplicableProduct) throw new NotFoundException('Promotion applicable product not found');

    return this.promotionApplicableProductRepository.updatePromotionApplicableProductById(promotionApplicableProduct);
  }
}
