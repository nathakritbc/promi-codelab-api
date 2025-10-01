import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { PromotionRuleId } from '../domains/promotionRule.domain';
import type { PromotionRuleRepository } from '../ports/promotionRule.repository';
import { promotionRuleRepositoryToken } from '../ports/promotionRule.repository';

@Injectable()
export class DeletePromotionRuleByIdUseCase {
  constructor(
    @Inject(promotionRuleRepositoryToken)
    private readonly promotionRuleRepository: PromotionRuleRepository,
  ) {}

  async execute({ id }: { id: PromotionRuleId }): Promise<void> {
    const ruleFound = await this.promotionRuleRepository.getPromotionRuleById({ id });
    if (!ruleFound) throw new NotFoundException('Promotion rule not found');
    return this.promotionRuleRepository.deletePromotionRuleById({ id });
  }
}
