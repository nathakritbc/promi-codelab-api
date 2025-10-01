import { Module } from '@nestjs/common';

// Controllers
import { PromotionApplicableProductController } from './adapters/inbounds/promotionApplicableProduct.controller';

// Use Cases
import { CreatePromotionApplicableProductUseCase } from './applications/usecases/createPromotionApplicableProduct.usecase';
import { DeletePromotionApplicableProductByIdUseCase } from './applications/usecases/deletePromotionApplicableProductById.usecase';
import { GetAllPromotionApplicableProductsUseCase } from './applications/usecases/getAllPromotionApplicableProducts.usecase';
import { GetPromotionApplicableProductByAssociationUseCase } from './applications/usecases/getPromotionApplicableProductByAssociation.usecase';
import { GetPromotionApplicableProductByIdUseCase } from './applications/usecases/getPromotionApplicableProductById.usecase';
import { GetPromotionApplicableProductsByProductIdUseCase } from './applications/usecases/getPromotionApplicableProductsByProductId.usecase';
import { GetPromotionApplicableProductsByPromotionIdUseCase } from './applications/usecases/getPromotionApplicableProductsByPromotionId.usecase';
import { UpdatePromotionApplicableProductByIdUseCase } from './applications/usecases/updatePromotionApplicableProductById.usecase';

// Repository binding
import { PromotionApplicableProductTypeOrmRepository } from './adapters/outbounds/promotionApplicableProduct.typeorm.repository';
import { promotionApplicableProductRepositoryToken } from './applications/ports/promotionApplicableProduct.repository';

@Module({
  controllers: [PromotionApplicableProductController],
  providers: [
    // Use Cases
    CreatePromotionApplicableProductUseCase,
    DeletePromotionApplicableProductByIdUseCase,
    GetAllPromotionApplicableProductsUseCase,
    GetPromotionApplicableProductByIdUseCase,
    GetPromotionApplicableProductsByPromotionIdUseCase,
    GetPromotionApplicableProductsByProductIdUseCase,
    GetPromotionApplicableProductByAssociationUseCase,
    UpdatePromotionApplicableProductByIdUseCase,

    // Repository binding
    {
      provide: promotionApplicableProductRepositoryToken,
      useClass: PromotionApplicableProductTypeOrmRepository,
    },
  ],
  exports: [
    // Export use cases if needed by other modules
    CreatePromotionApplicableProductUseCase,
    GetPromotionApplicableProductByIdUseCase,
    GetAllPromotionApplicableProductsUseCase,
    GetPromotionApplicableProductsByPromotionIdUseCase,
    GetPromotionApplicableProductsByProductIdUseCase,
    GetPromotionApplicableProductByAssociationUseCase,
  ],
})
export class PromotionApplicableProductsModule {}
