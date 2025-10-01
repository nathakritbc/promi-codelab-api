import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './createProduct.dto';

export class UpdateProductDto extends PartialType(OmitType(CreateProductDto, ['code'] as const)) {}
