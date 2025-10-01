import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import type {
  CategoryId,
  PromotionId,
} from 'src/promotion-applicable-categories/applications/domains/promotionApplicableCategory.domain';
import { EStatus } from 'src/types/utility.type';

export class CreatePromotionApplicableCategoryDto {
  @ApiProperty({
    type: String,
    example: 'promotion-uuid-123',
    description: 'The ID of the promotion',
  })
  @IsNotEmpty()
  @IsUUID()
  promotionId: PromotionId;

  @ApiProperty({
    type: String,
    example: 'category-uuid-456',
    description: 'The ID of the category',
  })
  @IsNotEmpty()
  @IsUUID()
  categoryId: CategoryId;

  @ApiProperty({
    type: Boolean,
    example: true,
    description: 'Whether to include child categories',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  includeChildren?: boolean;

  @ApiProperty({
    enum: EStatus,
    example: EStatus.ACTIVE,
    description: 'Promotion applicable category status',
    default: EStatus.ACTIVE,
  })
  @IsEnum(EStatus)
  @IsOptional()
  status?: EStatus;
}
