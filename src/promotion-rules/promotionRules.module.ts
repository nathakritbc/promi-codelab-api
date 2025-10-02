import { Module } from '@nestjs/common';

// Controllers
import { PromotionRuleController } from './adapters/inbounds/promotionRule.controller';

// Use Cases
import { CreatePromotionRuleUseCase } from './applications/usecases/createPromotionRule.usecase';
import { DeletePromotionRuleByIdUseCase } from './applications/usecases/deletePromotionRuleById.usecase';
import { GetAllPromotionRulesUseCase } from './applications/usecases/getAllPromotionRules.usecase';
import { GetPromotionRuleByIdUseCase } from './applications/usecases/getPromotionRuleById.usecase';
import { GetPromotionRulesByPromotionIdUseCase } from './applications/usecases/getPromotionRulesByPromotionId.usecase';
import { UpdatePromotionRuleByIdUseCase } from './applications/usecases/updatePromotionRuleById.usecase';

// Repository binding
import { PromotionRuleTypeOrmRepository } from './adapters/outbounds/promotionRule.typeorm.repository';
import { promotionRuleRepositoryToken } from './applications/ports/promotionRule.repository';

@Module({
  controllers: [PromotionRuleController],
  providers: [
    // Use Cases
    CreatePromotionRuleUseCase,
    DeletePromotionRuleByIdUseCase,
    GetAllPromotionRulesUseCase,
    GetPromotionRuleByIdUseCase,
    GetPromotionRulesByPromotionIdUseCase,
    UpdatePromotionRuleByIdUseCase,

    // Repository binding
    {
      provide: promotionRuleRepositoryToken,
      useClass: PromotionRuleTypeOrmRepository,
    },
  ],
  exports: [
    // Export use cases if needed by other modules
    CreatePromotionRuleUseCase,
    GetPromotionRuleByIdUseCase,
    GetAllPromotionRulesUseCase,
    GetPromotionRulesByPromotionIdUseCase,
    promotionRuleRepositoryToken,
  ],
})
export class PromotionRulesModule {}
