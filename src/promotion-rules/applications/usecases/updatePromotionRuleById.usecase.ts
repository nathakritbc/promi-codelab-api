import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { type IPromotionRule } from '../domains/promotionRule.domain';
import type { PromotionRuleRepository } from '../ports/promotionRule.repository';
import { promotionRuleRepositoryToken } from '../ports/promotionRule.repository';

@Injectable()
export class UpdatePromotionRuleByIdUseCase {
  constructor(
    @Inject(promotionRuleRepositoryToken)
    private readonly promotionRuleRepository: PromotionRuleRepository,
  ) {}

  async execute(promotionRule: IPromotionRule): Promise<IPromotionRule> {
    const existingRule = await this.promotionRuleRepository.getPromotionRuleById({
      id: promotionRule.uuid,
    });
    if (!existingRule) throw new NotFoundException('Promotion rule not found');

    return this.promotionRuleRepository.updatePromotionRuleById(promotionRule);
  }
}
