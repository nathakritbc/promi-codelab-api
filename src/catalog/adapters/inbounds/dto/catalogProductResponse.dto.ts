import { ApiProperty } from '@nestjs/swagger';
import type { CategoryId } from 'src/product-categories/applications/domains/productCategory.domain';
import type { DiscountType, PromotionId, PromotionName } from 'src/promotions/applications/domains/promotion.domain';
import type { Status } from 'src/types/utility.type';
import { type PromotionOfferSource, EPromotionOfferSource } from '../../../applications/domains/catalogProduct.domain';
import {
  type ProductCode,
  type ProductDescription,
  type ProductId,
  type ProductName,
} from 'src/products/applications/domains/product.domain';

class CatalogProductInfoDto {
  @ApiProperty()
  uuid: ProductId;

  @ApiProperty()
  code: ProductCode;

  @ApiProperty()
  name: ProductName;

  @ApiProperty()
  description?: ProductDescription;

  @ApiProperty()
  price: number;

  @ApiProperty()
  status: Status;
}

class PromotionOfferMetadataDto {
  @ApiProperty({ required: false })
  associationId?: string;

  @ApiProperty({ required: false })
  appliedCategoryId?: CategoryId;

  @ApiProperty({ required: false })
  includeChildren?: boolean;
}

export class PromotionOfferResponseDto {
  @ApiProperty()
  promotionId: PromotionId;

  @ApiProperty()
  name: PromotionName;

  @ApiProperty()
  discountType: DiscountType;

  @ApiProperty()
  discountValue: number;

  @ApiProperty({ required: false })
  maxDiscountAmount?: number;

  @ApiProperty()
  priority: number;

  @ApiProperty()
  discountAmount: number;

  @ApiProperty()
  finalPrice: number;

  @ApiProperty({ enum: EPromotionOfferSource })
  source: PromotionOfferSource;

  @ApiProperty({ type: () => PromotionOfferMetadataDto, required: false })
  metadata?: PromotionOfferMetadataDto;
}

export class CatalogProductResponseDto {
  @ApiProperty({ type: () => CatalogProductInfoDto })
  product: CatalogProductInfoDto;

  @ApiProperty()
  basePrice: number;

  @ApiProperty()
  finalPrice: number;

  @ApiProperty()
  discountAmount: number;

  @ApiProperty({ type: () => PromotionOfferResponseDto, required: false })
  appliedPromotion?: PromotionOfferResponseDto;

  @ApiProperty({ type: () => [PromotionOfferResponseDto] })
  promotions: PromotionOfferResponseDto[];
}

export class CatalogProductListResponseDto {
  @ApiProperty({ type: () => [CatalogProductResponseDto] })
  result: CatalogProductResponseDto[];

  @ApiProperty()
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
