import { ApiProperty } from '@nestjs/swagger';
import type {
  CategoryCreatedAt,
  CategoryId,
  CategoryLft,
  CategoryName,
  CategoryParentId,
  CategoryRgt,
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
  lft: CategoryLft;

  @ApiProperty()
  rgt: CategoryRgt;

  @ApiProperty()
  status: Status;

  @ApiProperty()
  createdAt: CategoryCreatedAt;

  @ApiProperty()
  updatedAt: CategoryUpdatedAt;
}
