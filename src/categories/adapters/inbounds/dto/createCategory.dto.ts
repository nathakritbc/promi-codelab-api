import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import type {
  CategoryLft,
  CategoryName,
  CategoryParentId,
  CategoryRgt,
} from 'src/categories/applications/domains/category.domain';
import { EStatus } from 'src/types/utility.type';

export class CreateCategoryDto {
  @ApiProperty({
    type: String,
    example: 'Electronics',
    description: 'The name of the category',
  })
  @IsNotEmpty()
  @IsString()
  name: CategoryName;

  @ApiProperty({
    type: String,
    example: 'parent-category-uuid',
    description: 'Parent category ID (optional for root categories)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  parentId?: CategoryParentId;

  @ApiProperty({
    type: Number,
    example: 1,
    description: 'Left boundary for nested set model',
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  lft: CategoryLft;

  @ApiProperty({
    type: Number,
    example: 2,
    description: 'Right boundary for nested set model',
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  rgt: CategoryRgt;

  @ApiProperty({
    enum: EStatus,
    example: EStatus.ACTIVE,
    description: 'Category status',
    default: EStatus.ACTIVE,
  })
  @IsEnum(EStatus)
  @IsOptional()
  status?: EStatus;
}
