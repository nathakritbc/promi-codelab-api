import { ApiProperty } from '@nestjs/swagger';
import type {
  CategoryId,
  ProductCategoryCreatedAt,
  ProductCategoryId,
  ProductCategoryUpdatedAt,
  ProductId,
} from 'src/product-categories/applications/domains/productCategory.domain';
import type { Status } from 'src/types/utility.type';

export class ProductCategoryResponseDto {
  @ApiProperty()
  uuid: ProductCategoryId;

  @ApiProperty()
  productId: ProductId;

  @ApiProperty()
  categoryId: CategoryId;

  @ApiProperty()
  status: Status;

  @ApiProperty()
  createdAt: ProductCategoryCreatedAt;

  @ApiProperty()
  updatedAt: ProductCategoryUpdatedAt;
}
