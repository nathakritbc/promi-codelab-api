import { Inject, Injectable } from '@nestjs/common';
import type {
  GetAllPromotionsQuery,
  GetAllPromotionsReturnType,
  PromotionRepository,
} from '../ports/promotion.repository';
import { promotionRepositoryToken } from '../ports/promotion.repository';

@Injectable()
export class GetAllPromotionsUseCase {
  constructor(
    @Inject(promotionRepositoryToken)
    private readonly promotionRepository: PromotionRepository,
  ) {}

  async execute(params: GetAllPromotionsQuery): Promise<GetAllPromotionsReturnType> {
    return this.promotionRepository.getAllPromotions({
      search: params.search,
      sort: params.sort,
      order: params.order,
      page: params.page,
      limit: params.limit,
      status: params.status,
      discountType: params.discountType,
    });
  }
}
