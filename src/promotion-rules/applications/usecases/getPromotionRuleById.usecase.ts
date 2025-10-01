import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IPromotionRule, PromotionRuleId } from '../domains/promotionRule.domain';
import type { PromotionRuleRepository } from '../ports/promotionRule.repository';
import { promotionRuleRepositoryToken } from '../ports/promotionRule.repository';

@Injectable()
export class GetPromotionRuleByIdUseCase {
  constructor(
    @Inject(promotionRuleRepositoryToken)
    private readonly promotionRuleRepository: PromotionRuleRepository,
  ) {}

  async execute({ id }: { id: PromotionRuleId }): Promise<IPromotionRule> {
    const promotionRule = await this.promotionRuleRepository.getPromotionRuleById({ id });
    if (!promotionRule) throw new NotFoundException('Promotion rule not found');

    return promotionRule;
  }
}
