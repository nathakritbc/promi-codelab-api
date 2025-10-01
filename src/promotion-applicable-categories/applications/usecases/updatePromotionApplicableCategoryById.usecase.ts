import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { type IPromotionApplicableCategory } from '../domains/promotionApplicableCategory.domain';
import type { PromotionApplicableCategoryRepository } from '../ports/promotionApplicableCategory.repository';
import { promotionApplicableCategoryRepositoryToken } from '../ports/promotionApplicableCategory.repository';

@Injectable()
export class UpdatePromotionApplicableCategoryByIdUseCase {
  constructor(
    @Inject(promotionApplicableCategoryRepositoryToken)
    private readonly promotionApplicableCategoryRepository: PromotionApplicableCategoryRepository,
  ) {}

  async execute(promotionApplicableCategory: IPromotionApplicableCategory): Promise<IPromotionApplicableCategory> {
    const existingPromotionApplicableCategory =
      await this.promotionApplicableCategoryRepository.getPromotionApplicableCategoryById({
        id: promotionApplicableCategory.uuid,
      });
    if (!existingPromotionApplicableCategory) throw new NotFoundException('Promotion applicable category not found');

    return this.promotionApplicableCategoryRepository.updatePromotionApplicableCategoryById(
      promotionApplicableCategory,
    );
  }
}
