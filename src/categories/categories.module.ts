import { Module } from '@nestjs/common';

// Controllers
import { CategoryController } from './adapters/inbounds/category.controller';

// Use Cases
import { CreateCategoryUseCase } from './applications/usecases/createCategory.usecase';
import { DeleteCategoryByIdUseCase } from './applications/usecases/deleteCategoryById.usecase';
import { GetAllCategoriesUseCase } from './applications/usecases/getAllCategories.usecase';
import { GetCategoriesByParentIdUseCase } from './applications/usecases/getCategoriesByParentId.usecase';
import { GetCategoryByIdUseCase } from './applications/usecases/getCategoryById.usecase';
import { UpdateCategoryByIdUseCase } from './applications/usecases/updateCategoryById.usecase';

// Repository binding
import { CategoryTypeOrmRepository } from './adapters/outbounds/category.typeorm.repository';
import { categoryRepositoryToken } from './applications/ports/category.repository';
import { CreateRootCategoryUseCase } from './applications/usecases/createRootCategory.usecase';

@Module({
  controllers: [CategoryController],
  providers: [
    // Use Cases
    CreateCategoryUseCase,
    CreateRootCategoryUseCase,
    DeleteCategoryByIdUseCase,
    GetAllCategoriesUseCase,
    GetCategoriesByParentIdUseCase,
    GetCategoryByIdUseCase,
    UpdateCategoryByIdUseCase,
    // Repository binding
    {
      provide: categoryRepositoryToken,
      useClass: CategoryTypeOrmRepository,
    },
  ],
  exports: [categoryRepositoryToken],
})
export class CategoriesModule {}
