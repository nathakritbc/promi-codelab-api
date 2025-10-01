import { OmitType, PartialType } from '@nestjs/swagger';
import { CreatePromotionRuleDto } from './createPromotionRule.dto';

export class UpdatePromotionRuleDto extends PartialType(OmitType(CreatePromotionRuleDto, ['promotionId'] as const)) {}
