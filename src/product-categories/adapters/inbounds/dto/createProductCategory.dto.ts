import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import type { CategoryId, ProductId } from 'src/product-categories/applications/domains/productCategory.domain';
import { EStatus } from 'src/types/utility.type';

export class CreateProductCategoryDto {
  @ApiProperty({
    type: String,
    example: 'product-uuid-123',
    description: 'The ID of the product',
  })
  @IsNotEmpty()
  @IsUUID()
  productId: ProductId;

  @ApiProperty({
    type: String,
    example: 'category-uuid-456',
    description: 'The ID of the category',
  })
  @IsNotEmpty()
  @IsUUID()
  categoryId: CategoryId;

  @ApiProperty({
    enum: EStatus,
    example: EStatus.ACTIVE,
    description: 'Product category status',
    default: EStatus.ACTIVE,
  })
  @IsEnum(EStatus)
  @IsOptional()
  status?: EStatus;
}
