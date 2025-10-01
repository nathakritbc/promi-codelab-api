import { Inject, Injectable } from '@nestjs/common';
import type { IPromotionApplicableCategory, PromotionId } from '../domains/promotionApplicableCategory.domain';
import type { PromotionApplicableCategoryRepository } from '../ports/promotionApplicableCategory.repository';
import { promotionApplicableCategoryRepositoryToken } from '../ports/promotionApplicableCategory.repository';

@Injectable()
export class GetPromotionApplicableCategoriesByPromotionIdUseCase {
  constructor(
    @Inject(promotionApplicableCategoryRepositoryToken)
    private readonly promotionApplicableCategoryRepository: PromotionApplicableCategoryRepository,
  ) {}

  async execute({ promotionId }: { promotionId: PromotionId }): Promise<IPromotionApplicableCategory[]> {
    return this.promotionApplicableCategoryRepository.getPromotionApplicableCategoriesByPromotionId({ promotionId });
  }
}
