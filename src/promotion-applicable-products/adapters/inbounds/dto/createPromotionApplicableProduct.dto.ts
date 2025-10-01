import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import type {
  ProductId,
  PromotionId,
} from 'src/promotion-applicable-products/applications/domains/promotionApplicableProduct.domain';
import { EStatus } from 'src/types/utility.type';

export class CreatePromotionApplicableProductDto {
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
    example: 'product-uuid-456',
    description: 'The ID of the product',
  })
  @IsNotEmpty()
  @IsUUID()
  productId: ProductId;

  @ApiProperty({
    enum: EStatus,
    example: EStatus.ACTIVE,
    description: 'Promotion applicable product status',
    default: EStatus.ACTIVE,
  })
  @IsEnum(EStatus)
  @IsOptional()
  status?: EStatus;
}
