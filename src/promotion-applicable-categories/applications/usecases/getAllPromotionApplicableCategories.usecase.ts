import { Inject, Injectable } from '@nestjs/common';
import type {
  GetAllPromotionApplicableCategoriesQuery,
  GetAllPromotionApplicableCategoriesReturnType,
  PromotionApplicableCategoryRepository,
} from '../ports/promotionApplicableCategory.repository';
import { promotionApplicableCategoryRepositoryToken } from '../ports/promotionApplicableCategory.repository';

@Injectable()
export class GetAllPromotionApplicableCategoriesUseCase {
  constructor(
    @Inject(promotionApplicableCategoryRepositoryToken)
    private readonly promotionApplicableCategoryRepository: PromotionApplicableCategoryRepository,
  ) {}

  async execute(
    params: GetAllPromotionApplicableCategoriesQuery,
  ): Promise<GetAllPromotionApplicableCategoriesReturnType> {
    return this.promotionApplicableCategoryRepository.getAllPromotionApplicableCategories(params);
  }
}
