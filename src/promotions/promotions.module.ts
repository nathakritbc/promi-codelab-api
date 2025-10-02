import { Module } from '@nestjs/common';

// Controllers
import { PromotionController } from './adapters/inbounds/promotion.controller';

// Use Cases
import { CreatePromotionUseCase } from './applications/usecases/createPromotion.usecase';
import { DeletePromotionByIdUseCase } from './applications/usecases/deletePromotionById.usecase';
import { GetAllPromotionsUseCase } from './applications/usecases/getAllPromotions.usecase';
import { GetPromotionByIdUseCase } from './applications/usecases/getPromotionById.usecase';
import { UpdatePromotionByIdUseCase } from './applications/usecases/updatePromotionById.usecase';

// Repository binding
import { PromotionTypeOrmRepository } from './adapters/outbounds/promotion.typeorm.repository';
import { promotionRepositoryToken } from './applications/ports/promotion.repository';

@Module({
  controllers: [PromotionController],
  providers: [
    // Use Cases
    CreatePromotionUseCase,
    DeletePromotionByIdUseCase,
    GetAllPromotionsUseCase,
    GetPromotionByIdUseCase,
    UpdatePromotionByIdUseCase,

    // Repository binding
    {
      provide: promotionRepositoryToken,
      useClass: PromotionTypeOrmRepository,
    },
  ],
  exports: [
    // Export use cases if needed by other modules
    CreatePromotionUseCase,
    GetPromotionByIdUseCase,
    GetAllPromotionsUseCase,
    promotionRepositoryToken,
  ],
})
export class PromotionsModule {}
