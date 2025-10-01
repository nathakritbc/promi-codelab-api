import { Inject, Injectable } from '@nestjs/common';
import type { CategoryId, IPromotionApplicableCategory } from '../domains/promotionApplicableCategory.domain';
import type { PromotionApplicableCategoryRepository } from '../ports/promotionApplicableCategory.repository';
import { promotionApplicableCategoryRepositoryToken } from '../ports/promotionApplicableCategory.repository';

@Injectable()
export class GetPromotionApplicableCategoriesByCategoryIdUseCase {
  constructor(
    @Inject(promotionApplicableCategoryRepositoryToken)
    private readonly promotionApplicableCategoryRepository: PromotionApplicableCategoryRepository,
  ) {}

  async execute({ categoryId }: { categoryId: CategoryId }): Promise<IPromotionApplicableCategory[]> {
    return this.promotionApplicableCategoryRepository.getPromotionApplicableCategoriesByCategoryId({ categoryId });
  }
}
