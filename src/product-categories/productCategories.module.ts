import { Module } from '@nestjs/common';

// Controllers
import { ProductCategoryController } from './adapters/inbounds/productCategory.controller';

// Use Cases
import { CreateProductCategoryUseCase } from './applications/usecases/createProductCategory.usecase';
import { DeleteProductCategoryByIdUseCase } from './applications/usecases/deleteProductCategoryById.usecase';
import { GetAllProductCategoriesUseCase } from './applications/usecases/getAllProductCategories.usecase';
import { GetProductCategoriesByCategoryIdUseCase } from './applications/usecases/getProductCategoriesByCategoryId.usecase';
import { GetProductCategoriesByProductIdUseCase } from './applications/usecases/getProductCategoriesByProductId.usecase';
import { GetProductCategoryByAssociationUseCase } from './applications/usecases/getProductCategoryByAssociation.usecase';
import { GetProductCategoryByIdUseCase } from './applications/usecases/getProductCategoryById.usecase';
import { UpdateProductCategoryByIdUseCase } from './applications/usecases/updateProductCategoryById.usecase';

// Repository binding
import { ProductCategoryTypeOrmRepository } from './adapters/outbounds/productCategory.typeorm.repository';
import { productCategoryRepositoryToken } from './applications/ports/productCategory.repository';

@Module({
  controllers: [ProductCategoryController],
  providers: [
    // Use Cases
    CreateProductCategoryUseCase,
    DeleteProductCategoryByIdUseCase,
    GetAllProductCategoriesUseCase,
    GetProductCategoryByIdUseCase,
    GetProductCategoriesByProductIdUseCase,
    GetProductCategoriesByCategoryIdUseCase,
    GetProductCategoryByAssociationUseCase,
    UpdateProductCategoryByIdUseCase,

    // Repository binding
    {
      provide: productCategoryRepositoryToken,
      useClass: ProductCategoryTypeOrmRepository,
    },
  ],
  exports: [
    // Export use cases if needed by other modules
    CreateProductCategoryUseCase,
    GetProductCategoryByIdUseCase,
    GetAllProductCategoriesUseCase,
    GetProductCategoriesByProductIdUseCase,
    GetProductCategoriesByCategoryIdUseCase,
    GetProductCategoryByAssociationUseCase,
  ],
})
export class ProductCategoriesModule {}
