import { Inject, Injectable } from '@nestjs/common';
import { IPromotionRule } from '../domains/promotionRule.domain';
import type { PromotionRuleRepository } from '../ports/promotionRule.repository';
import { promotionRuleRepositoryToken } from '../ports/promotionRule.repository';

@Injectable()
export class CreatePromotionRuleUseCase {
  constructor(
    @Inject(promotionRuleRepositoryToken)
    private readonly promotionRuleRepository: PromotionRuleRepository,
  ) {}

  async execute(promotionRule: IPromotionRule): Promise<IPromotionRule> {
    return await this.promotionRuleRepository.createPromotionRule(promotionRule);
  }
}
