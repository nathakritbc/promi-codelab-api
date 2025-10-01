import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { PromotionApplicableCategoryId } from '../domains/promotionApplicableCategory.domain';
import type { PromotionApplicableCategoryRepository } from '../ports/promotionApplicableCategory.repository';
import { promotionApplicableCategoryRepositoryToken } from '../ports/promotionApplicableCategory.repository';

@Injectable()
export class DeletePromotionApplicableCategoryByIdUseCase {
  constructor(
    @Inject(promotionApplicableCategoryRepositoryToken)
    private readonly promotionApplicableCategoryRepository: PromotionApplicableCategoryRepository,
  ) {}

  async execute({ id }: { id: PromotionApplicableCategoryId }): Promise<void> {
    const promotionApplicableCategoryFound =
      await this.promotionApplicableCategoryRepository.getPromotionApplicableCategoryById({ id });
    if (!promotionApplicableCategoryFound) throw new NotFoundException('Promotion applicable category not found');
    return this.promotionApplicableCategoryRepository.deletePromotionApplicableCategoryById({ id });
  }
}
