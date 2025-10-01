import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type {
  CategoryId,
  IPromotionApplicableCategory,
  PromotionId,
} from '../domains/promotionApplicableCategory.domain';
import type { PromotionApplicableCategoryRepository } from '../ports/promotionApplicableCategory.repository';
import { promotionApplicableCategoryRepositoryToken } from '../ports/promotionApplicableCategory.repository';

@Injectable()
export class GetPromotionApplicableCategoryByAssociationUseCase {
  constructor(
    @Inject(promotionApplicableCategoryRepositoryToken)
    private readonly promotionApplicableCategoryRepository: PromotionApplicableCategoryRepository,
  ) {}

  async execute({
    promotionId,
    categoryId,
  }: {
    promotionId: PromotionId;
    categoryId: CategoryId;
  }): Promise<IPromotionApplicableCategory> {
    const promotionApplicableCategory =
      await this.promotionApplicableCategoryRepository.getPromotionApplicableCategoryByAssociation({
        promotionId,
        categoryId,
      });
    if (!promotionApplicableCategory)
      throw new NotFoundException('Promotion applicable category association not found');

    return promotionApplicableCategory;
  }
}
