import { Inject, Injectable } from '@nestjs/common';
import { IPromotionApplicableProduct } from '../domains/promotionApplicableProduct.domain';
import type { PromotionApplicableProductRepository } from '../ports/promotionApplicableProduct.repository';
import { promotionApplicableProductRepositoryToken } from '../ports/promotionApplicableProduct.repository';

@Injectable()
export class CreatePromotionApplicableProductUseCase {
  constructor(
    @Inject(promotionApplicableProductRepositoryToken)
    private readonly promotionApplicableProductRepository: PromotionApplicableProductRepository,
  ) {}

  async execute(promotionApplicableProduct: IPromotionApplicableProduct): Promise<IPromotionApplicableProduct> {
    return this.promotionApplicableProductRepository.createPromotionApplicableProduct(promotionApplicableProduct);
  }
}
