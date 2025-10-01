import { ApiProperty } from '@nestjs/swagger';
import type {
  CategoryId,
  PromotionApplicableCategoryCreatedAt,
  PromotionApplicableCategoryId,
  PromotionApplicableCategoryUpdatedAt,
  PromotionId,
} from 'src/promotion-applicable-categories/applications/domains/promotionApplicableCategory.domain';
import type { Status } from 'src/types/utility.type';

export class PromotionApplicableCategoryResponseDto {
  @ApiProperty()
  uuid: PromotionApplicableCategoryId;

  @ApiProperty()
  promotionId: PromotionId;

  @ApiProperty()
  categoryId: CategoryId;

  @ApiProperty()
  includeChildren: boolean;

  @ApiProperty()
  status: Status;

  @ApiProperty()
  createdAt: PromotionApplicableCategoryCreatedAt;

  @ApiProperty()
  updatedAt: PromotionApplicableCategoryUpdatedAt;
}
