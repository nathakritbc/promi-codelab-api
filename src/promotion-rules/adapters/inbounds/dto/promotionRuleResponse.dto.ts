import { ApiProperty } from '@nestjs/swagger';
import type {
  PromotionRuleCreatedAt,
  PromotionRuleId,
  PromotionRuleMinAmount,
  PromotionRuleMinQty,
  PromotionRuleScope,
  PromotionRuleUpdatedAt,
} from 'src/promotion-rules/applications/domains/promotionRule.domain';
import type { PromotionId } from 'src/promotions/applications/domains/promotion.domain';

export class PromotionRuleResponseDto {
  @ApiProperty()
  uuid: PromotionRuleId;

  @ApiProperty()
  promotionId: PromotionId;

  @ApiProperty()
  scope: PromotionRuleScope;

  @ApiProperty()
  minQty?: PromotionRuleMinQty;

  @ApiProperty()
  minAmount?: PromotionRuleMinAmount;

  @ApiProperty()
  createdAt: PromotionRuleCreatedAt;

  @ApiProperty()
  updatedAt: PromotionRuleUpdatedAt;
}
