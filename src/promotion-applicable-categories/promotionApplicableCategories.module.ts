import { Module } from '@nestjs/common';

// Controllers
import { PromotionApplicableCategoryController } from './adapters/inbounds/promotionApplicableCategory.controller';

// Use Cases
import { CreatePromotionApplicableCategoryUseCase } from './applications/usecases/createPromotionApplicableCategory.usecase';
import { DeletePromotionApplicableCategoryByIdUseCase } from './applications/usecases/deletePromotionApplicableCategoryById.usecase';
import { GetAllPromotionApplicableCategoriesUseCase } from './applications/usecases/getAllPromotionApplicableCategories.usecase';
import { GetPromotionApplicableCategoriesByCategoryIdUseCase } from './applications/usecases/getPromotionApplicableCategoriesByCategoryId.usecase';
import { GetPromotionApplicableCategoriesByPromotionIdUseCase } from './applications/usecases/getPromotionApplicableCategoriesByPromotionId.usecase';
import { GetPromotionApplicableCategoryByAssociationUseCase } from './applications/usecases/getPromotionApplicableCategoryByAssociation.usecase';
import { GetPromotionApplicableCategoryByIdUseCase } from './applications/usecases/getPromotionApplicableCategoryById.usecase';
import { UpdatePromotionApplicableCategoryByIdUseCase } from './applications/usecases/updatePromotionApplicableCategoryById.usecase';

// Repository binding
import { PromotionApplicableCategoryTypeOrmRepository } from './adapters/outbounds/promotionApplicableCategory.typeorm.repository';
import { promotionApplicableCategoryRepositoryToken } from './applications/ports/promotionApplicableCategory.repository';

@Module({
  controllers: [PromotionApplicableCategoryController],
  providers: [
    // Use Cases
    CreatePromotionApplicableCategoryUseCase,
    DeletePromotionApplicableCategoryByIdUseCase,
    GetAllPromotionApplicableCategoriesUseCase,
    GetPromotionApplicableCategoryByIdUseCase,
    GetPromotionApplicableCategoriesByPromotionIdUseCase,
    GetPromotionApplicableCategoriesByCategoryIdUseCase,
    GetPromotionApplicableCategoryByAssociationUseCase,
    UpdatePromotionApplicableCategoryByIdUseCase,

    // Repository binding
    {
      provide: promotionApplicableCategoryRepositoryToken,
      useClass: PromotionApplicableCategoryTypeOrmRepository,
    },
  ],
  exports: [
    // Export use cases if needed by other modules
    CreatePromotionApplicableCategoryUseCase,
    GetPromotionApplicableCategoryByIdUseCase,
    GetAllPromotionApplicableCategoriesUseCase,
    GetPromotionApplicableCategoriesByPromotionIdUseCase,
    GetPromotionApplicableCategoriesByCategoryIdUseCase,
    GetPromotionApplicableCategoryByAssociationUseCase,
  ],
})
export class PromotionApplicableCategoriesModule {}
