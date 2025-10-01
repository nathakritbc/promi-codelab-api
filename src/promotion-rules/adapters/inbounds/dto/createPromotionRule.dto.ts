import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsUUID, Min } from 'class-validator';
import {
  EPromotionRuleScope,
  type PromotionRuleMinAmount,
  type PromotionRuleMinQty,
} from 'src/promotion-rules/applications/domains/promotionRule.domain';
import type { PromotionId } from 'src/promotions/applications/domains/promotion.domain';

export class CreatePromotionRuleDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'The promotion ID this rule belongs to',
  })
  @IsNotEmpty()
  @IsUUID()
  promotionId: PromotionId;

  @ApiProperty({
    enum: EPromotionRuleScope,
    example: EPromotionRuleScope.PRODUCT,
    description: 'The scope of the promotion rule (product or category)',
  })
  @IsEnum(EPromotionRuleScope)
  @IsNotEmpty()
  scope: EPromotionRuleScope;

  @ApiProperty({
    type: Number,
    example: 5,
    description: 'Minimum quantity required',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  minQty?: PromotionRuleMinQty;

  @ApiProperty({
    type: Number,
    example: 1000,
    description: 'Minimum amount required',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  minAmount?: PromotionRuleMinAmount;
}
