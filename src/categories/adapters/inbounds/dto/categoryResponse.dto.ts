import { ApiProperty } from '@nestjs/swagger';
import type {
  CategoryCreatedAt,
  CategoryId,
  CategoryName,
  CategoryParentId,
  CategoryUpdatedAt,
} from 'src/categories/applications/domains/category.domain';
import type { Status } from 'src/types/utility.type';

export class CategoryResponseDto {
  @ApiProperty()
  uuid: CategoryId;

  @ApiProperty()
  name: CategoryName;

  @ApiProperty()
  parentId?: CategoryParentId;

  @ApiProperty()
  ancestors: string[];

  @ApiProperty()
  status: Status;

  @ApiProperty()
  createdAt: CategoryCreatedAt;

  @ApiProperty()
  updatedAt: CategoryUpdatedAt;
}
