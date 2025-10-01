import { PartialType } from '@nestjs/swagger';
import { CreateProductCategoryDto } from './createProductCategory.dto';

export class UpdateProductCategoryDto extends PartialType(CreateProductCategoryDto) {}
