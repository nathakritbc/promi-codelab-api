import { Module } from '@nestjs/common';

// Controllers
import { ProductAdminController } from './adapters/inbounds/product.admin.controller';
import { ProductController } from './adapters/inbounds/product.controller';

// Use Cases
import { CreateProductUseCase } from './applications/usecases/createProduct.usecase';
import { DeleteProductByIdUseCase } from './applications/usecases/deleteProductById.usecase';
import { GetAllProductsUseCase } from './applications/usecases/getAllProducts.usecase';
import { GetProductByIdUseCase } from './applications/usecases/getProductById.usecase';
import { UpdateProductByIdUseCase } from './applications/usecases/updateProductById.usecase';

// Repository binding
import { ProductTypeOrmRepository } from './adapters/outbounds/product.typeorm.repository';
import { productRepositoryToken } from './applications/ports/product.repository';

@Module({
  controllers: [ProductAdminController, ProductController],
  providers: [
    // Use Cases
    CreateProductUseCase,
    DeleteProductByIdUseCase,
    GetAllProductsUseCase,
    GetProductByIdUseCase,
    UpdateProductByIdUseCase,

    // Repository binding
    {
      provide: productRepositoryToken,
      useClass: ProductTypeOrmRepository,
    },
  ],
  exports: [
    // Export use cases if needed by other modules
    CreateProductUseCase,
    GetProductByIdUseCase,
    GetAllProductsUseCase,
  ],
})
export class ProductsModule {}
