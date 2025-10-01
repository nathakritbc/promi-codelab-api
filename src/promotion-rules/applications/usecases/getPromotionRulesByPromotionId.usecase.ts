import { Inject, Injectable } from '@nestjs/common';
import type { PromotionId } from 'src/promotions/applications/domains/promotion.domain';
import type { IPromotionRule } from '../domains/promotionRule.domain';
import type { PromotionRuleRepository } from '../ports/promotionRule.repository';
import { promotionRuleRepositoryToken } from '../ports/promotionRule.repository';

@Injectable()
export class GetPromotionRulesByPromotionIdUseCase {
  constructor(
    @Inject(promotionRuleRepositoryToken)
    private readonly promotionRuleRepository: PromotionRuleRepository,
  ) {}

  async execute({ promotionId }: { promotionId: PromotionId }): Promise<IPromotionRule[]> {
    return this.promotionRuleRepository.getPromotionRulesByPromotionId({ promotionId });
  }
}
