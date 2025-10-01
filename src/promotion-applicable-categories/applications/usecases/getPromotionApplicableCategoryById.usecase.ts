import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type {
  IPromotionApplicableCategory,
  PromotionApplicableCategoryId,
} from '../domains/promotionApplicableCategory.domain';
import type { PromotionApplicableCategoryRepository } from '../ports/promotionApplicableCategory.repository';
import { promotionApplicableCategoryRepositoryToken } from '../ports/promotionApplicableCategory.repository';

@Injectable()
export class GetPromotionApplicableCategoryByIdUseCase {
  constructor(
    @Inject(promotionApplicableCategoryRepositoryToken)
    private readonly promotionApplicableCategoryRepository: PromotionApplicableCategoryRepository,
  ) {}

  async execute({ id }: { id: PromotionApplicableCategoryId }): Promise<IPromotionApplicableCategory> {
    const promotionApplicableCategory =
      await this.promotionApplicableCategoryRepository.getPromotionApplicableCategoryById({ id });
    if (!promotionApplicableCategory) throw new NotFoundException('Promotion applicable category not found');

    return promotionApplicableCategory;
  }
}
