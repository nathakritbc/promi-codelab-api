import { Inject, Injectable } from '@nestjs/common';
import type {
  GetAllPromotionRulesQuery,
  GetAllPromotionRulesReturnType,
  PromotionRuleRepository,
} from '../ports/promotionRule.repository';
import { promotionRuleRepositoryToken } from '../ports/promotionRule.repository';

@Injectable()
export class GetAllPromotionRulesUseCase {
  constructor(
    @Inject(promotionRuleRepositoryToken)
    private readonly promotionRuleRepository: PromotionRuleRepository,
  ) {}

  async execute(params: GetAllPromotionRulesQuery): Promise<GetAllPromotionRulesReturnType> {
    return this.promotionRuleRepository.getAllPromotionRules({
      search: params.search,
      sort: params.sort,
      order: params.order,
      page: params.page,
      limit: params.limit,
      promotionId: params.promotionId,
      scope: params.scope,
    });
  }
}
