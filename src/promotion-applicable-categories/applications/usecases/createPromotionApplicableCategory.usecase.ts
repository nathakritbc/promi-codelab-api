import { Inject, Injectable } from '@nestjs/common';
import { IPromotionApplicableCategory } from '../domains/promotionApplicableCategory.domain';
import type { PromotionApplicableCategoryRepository } from '../ports/promotionApplicableCategory.repository';
import { promotionApplicableCategoryRepositoryToken } from '../ports/promotionApplicableCategory.repository';

@Injectable()
export class CreatePromotionApplicableCategoryUseCase {
  constructor(
    @Inject(promotionApplicableCategoryRepositoryToken)
    private readonly promotionApplicableCategoryRepository: PromotionApplicableCategoryRepository,
  ) {}

  async execute(promotionApplicableCategory: IPromotionApplicableCategory): Promise<IPromotionApplicableCategory> {
    return this.promotionApplicableCategoryRepository.createPromotionApplicableCategory(promotionApplicableCategory);
  }
}
