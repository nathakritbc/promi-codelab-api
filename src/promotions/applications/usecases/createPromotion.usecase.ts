import { Inject, Injectable } from '@nestjs/common';
import { IPromotion } from '../domains/promotion.domain';
import type { PromotionRepository } from '../ports/promotion.repository';
import { promotionRepositoryToken } from '../ports/promotion.repository';

@Injectable()
export class CreatePromotionUseCase {
  constructor(
    @Inject(promotionRepositoryToken)
    private readonly promotionRepository: PromotionRepository,
  ) {}

  async execute(promotion: IPromotion): Promise<IPromotion> {
    return await this.promotionRepository.createPromotion(promotion);
  }
}
