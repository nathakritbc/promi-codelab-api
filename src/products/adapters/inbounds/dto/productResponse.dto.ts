import { ApiProperty } from '@nestjs/swagger';
import type {
  ProductCode,
  ProductCreatedAt,
  ProductDescription,
  ProductId,
  ProductName,
  ProductPrice,
  ProductUpdatedAt,
} from 'src/products/applications/domains/product.domain';
import type { Status } from 'src/types/utility.type';

export class ProductResponseDto {
  @ApiProperty()
  uuid: ProductId;

  @ApiProperty()
  code: ProductCode;

  @ApiProperty()
  name: ProductName;

  @ApiProperty()
  description?: ProductDescription;

  @ApiProperty()
  price: ProductPrice;

  @ApiProperty()
  status: Status;

  @ApiProperty()
  createdAt: ProductCreatedAt;

  @ApiProperty()
  updatedAt: ProductUpdatedAt;
}
