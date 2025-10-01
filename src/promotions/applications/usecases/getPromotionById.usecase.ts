import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IPromotion, PromotionId } from '../domains/promotion.domain';
import type { PromotionRepository } from '../ports/promotion.repository';
import { promotionRepositoryToken } from '../ports/promotion.repository';

@Injectable()
export class GetPromotionByIdUseCase {
  constructor(
    @Inject(promotionRepositoryToken)
    private readonly promotionRepository: PromotionRepository,
  ) {}

  async execute({ id }: { id: PromotionId }): Promise<IPromotion> {
    const promotion = await this.promotionRepository.getPromotionById({ id });
    if (!promotion) throw new NotFoundException('Promotion not found');

    return promotion;
  }
}
