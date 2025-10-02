import { PartialType } from '@nestjs/swagger';
import { CreatePromotionRuleDto } from './createPromotionRule.dto';

export class UpdatePromotionRuleDto extends PartialType(CreatePromotionRuleDto) {}
