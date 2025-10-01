import { PartialType } from '@nestjs/swagger';
import { CreatePromotionDto } from './createPromotion.dto';

export class UpdatePromotionDto extends PartialType(CreatePromotionDto) {}

