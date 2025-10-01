import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';
import type {
  PromotionDiscountValue,
  PromotionEndsAt,
  PromotionMaxDiscountAmount,
  PromotionName,
  PromotionPriority,
  PromotionStartsAt,
} from 'src/promotions/applications/domains/promotion.domain';
import { EDiscountType, EPromotionStatus } from 'src/promotions/applications/domains/promotion.domain';

export class CreatePromotionDto {
  @ApiProperty({
    type: String,
    example: 'Summer Sale 2025',
    description: 'The name of the promotion',
  })
  @IsNotEmpty()
  name: PromotionName;

  @ApiProperty({
    enum: EPromotionStatus,
    example: EPromotionStatus.DRAFT,
    description: 'The status of the promotion',
    default: EPromotionStatus.DRAFT,
  })
  @IsEnum(EPromotionStatus)
  @IsOptional()
  status?: EPromotionStatus;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2025-06-01T00:00:00Z',
    description: 'The start date and time of the promotion',
  })
  @IsNotEmpty()
  @IsDateString()
  startsAt: PromotionStartsAt;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2025-08-31T23:59:59Z',
    description: 'The end date and time of the promotion',
  })
  @IsNotEmpty()
  @IsDateString()
  endsAt: PromotionEndsAt;

  @ApiProperty({
    enum: EDiscountType,
    example: EDiscountType.PERCENT,
    description: 'The type of discount (Percent or Fixed)',
    default: EDiscountType.PERCENT,
  })
  @IsEnum(EDiscountType)
  @IsOptional()
  discountType?: EDiscountType;

  @ApiProperty({
    type: Number,
    example: 10,
    description: 'The discount value (percentage or fixed amount)',
    default: 0,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  discountValue: PromotionDiscountValue;

  @ApiProperty({
    type: Number,
    example: 100,
    description: 'The maximum discount amount (for percentage discounts)',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxDiscountAmount?: PromotionMaxDiscountAmount;

  @ApiProperty({
    type: Number,
    example: 1,
    description: 'The priority of the promotion (higher value = higher priority)',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: PromotionPriority;
}

