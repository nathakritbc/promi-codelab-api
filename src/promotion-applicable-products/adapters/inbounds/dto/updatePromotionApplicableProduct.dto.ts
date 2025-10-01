import { PartialType } from '@nestjs/swagger';
import { CreatePromotionApplicableProductDto } from './createPromotionApplicableProduct.dto';

export class UpdatePromotionApplicableProductDto extends PartialType(CreatePromotionApplicableProductDto) {}
