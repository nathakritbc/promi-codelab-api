import { Inject, Injectable } from '@nestjs/common';
import type {
  GetAllPromotionApplicableProductsQuery,
  GetAllPromotionApplicableProductsReturnType,
  PromotionApplicableProductRepository,
} from '../ports/promotionApplicableProduct.repository';
import { promotionApplicableProductRepositoryToken } from '../ports/promotionApplicableProduct.repository';

@Injectable()
export class GetAllPromotionApplicableProductsUseCase {
  constructor(
    @Inject(promotionApplicableProductRepositoryToken)
    private readonly promotionApplicableProductRepository: PromotionApplicableProductRepository,
  ) {}

  async execute(params: GetAllPromotionApplicableProductsQuery): Promise<GetAllPromotionApplicableProductsReturnType> {
    return this.promotionApplicableProductRepository.getAllPromotionApplicableProducts(params);
  }
}
