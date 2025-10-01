import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import type {
  ProductCode,
  ProductDescription,
  ProductName,
  ProductPrice,
} from 'src/products/applications/domains/product.domain';
import { EStatus } from 'src/types/utility.type';

export class CreateProductDto {
  @ApiProperty({
    type: String,
    example: 'PROD-001',
    description: 'Unique product code',
  })
  @IsNotEmpty()
  @IsString()
  code: ProductCode;

  @ApiProperty({
    type: String,
    example: 'Wireless Mouse',
    description: 'The name of the product',
  })
  @IsNotEmpty()
  @IsString()
  name: ProductName;

  @ApiProperty({
    type: String,
    example: 'High-quality wireless mouse with ergonomic design',
    description: 'Product description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: ProductDescription;

  @ApiProperty({
    type: Number,
    example: 299,
    description: 'Product price',
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  price: ProductPrice;

  @ApiProperty({
    enum: EStatus,
    example: EStatus.ACTIVE,
    description: 'Product status',
    default: EStatus.ACTIVE,
  })
  @IsEnum(EStatus)
  @IsOptional()
  status?: EStatus;
}
