import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { PromotionId } from '../domains/promotion.domain';
import type { PromotionRepository } from '../ports/promotion.repository';
import { promotionRepositoryToken } from '../ports/promotion.repository';

@Injectable()
export class DeletePromotionByIdUseCase {
  constructor(
    @Inject(promotionRepositoryToken)
    private readonly promotionRepository: PromotionRepository,
  ) {}

  async execute({ id }: { id: PromotionId }): Promise<void> {
    const promotionFound = await this.promotionRepository.getPromotionById({ id });
    if (!promotionFound) throw new NotFoundException('Promotion not found');
    return this.promotionRepository.deletePromotionById({ id });
  }
}
