import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import type { CategoryName, CategoryParentId } from 'src/categories/applications/domains/category.domain';
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
    type: String,
    example: ['Electronics', 'Smartphones'],
    required: false,
    description: 'The ancestors of the category',
  })
  @IsOptional()
  @IsArray()
  ancestors?: string[];

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
