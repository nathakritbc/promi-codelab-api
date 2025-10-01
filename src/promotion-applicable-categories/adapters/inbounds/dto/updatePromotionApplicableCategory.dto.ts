import { PartialType } from '@nestjs/swagger';
import { CreatePromotionApplicableCategoryDto } from './createPromotionApplicableCategory.dto';

export class UpdatePromotionApplicableCategoryDto extends PartialType(CreatePromotionApplicableCategoryDto) {}
