import { ApiProperty } from '@nestjs/swagger';
import type {
  DiscountType,
  PromotionCreatedAt,
  PromotionDiscountValue,
  PromotionEndsAt,
  PromotionId,
  PromotionMaxDiscountAmount,
  PromotionName,
  PromotionPriority,
  PromotionStartsAt,
  PromotionStatus,
  PromotionUpdatedAt,
} from 'src/promotions/applications/domains/promotion.domain';

export class PromotionResponseDto {
  @ApiProperty()
  uuid: PromotionId;

  @ApiProperty()
  name: PromotionName;

  @ApiProperty()
  status: PromotionStatus;

  @ApiProperty()
  startsAt: PromotionStartsAt;

  @ApiProperty()
  endsAt: PromotionEndsAt;

  @ApiProperty()
  discountType: DiscountType;

  @ApiProperty()
  discountValue: PromotionDiscountValue;

  @ApiProperty()
  maxDiscountAmount?: PromotionMaxDiscountAmount;

  @ApiProperty()
  priority: PromotionPriority;

  @ApiProperty()
  createdAt: PromotionCreatedAt;

  @ApiProperty()
  updatedAt: PromotionUpdatedAt;
}

