import { ApiProperty } from '@nestjs/swagger';
import type {
  ProductId,
  PromotionApplicableProductCreatedAt,
  PromotionApplicableProductId,
  PromotionApplicableProductUpdatedAt,
  PromotionId,
} from 'src/promotion-applicable-products/applications/domains/promotionApplicableProduct.domain';
import type { Status } from 'src/types/utility.type';

export class PromotionApplicableProductResponseDto {
  @ApiProperty()
  uuid: PromotionApplicableProductId;

  @ApiProperty()
  promotionId: PromotionId;

  @ApiProperty()
  productId: ProductId;

  @ApiProperty()
  status: Status;

  @ApiProperty()
  createdAt: PromotionApplicableProductCreatedAt;

  @ApiProperty()
  updatedAt: PromotionApplicableProductUpdatedAt;
}
