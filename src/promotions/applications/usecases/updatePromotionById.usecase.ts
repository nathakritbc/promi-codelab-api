import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { type IPromotion } from '../domains/promotion.domain';
import type { PromotionRepository } from '../ports/promotion.repository';
import { promotionRepositoryToken } from '../ports/promotion.repository';

@Injectable()
export class UpdatePromotionByIdUseCase {
  constructor(
    @Inject(promotionRepositoryToken)
    private readonly promotionRepository: PromotionRepository,
  ) {}

  async execute(promotion: IPromotion): Promise<IPromotion> {
    const existingPromotion = await this.promotionRepository.getPromotionById({ id: promotion.uuid });
    if (!existingPromotion) throw new NotFoundException('Promotion not found');

    return this.promotionRepository.updatePromotionById(promotion);
  }
}
