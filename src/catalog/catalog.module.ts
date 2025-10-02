import { Module } from '@nestjs/common';
import { CategoriesModule } from 'src/categories/categories.module';
import { ProductCategoriesModule } from 'src/product-categories/productCategories.module';
import { ProductTypeOrmRepository } from 'src/products/adapters/outbounds/product.typeorm.repository';
import { productRepositoryToken } from 'src/products/applications/ports/product.repository';
import { ProductsModule } from 'src/products/products.module';
import { PromotionApplicableCategoriesModule } from 'src/promotion-applicable-categories/promotionApplicableCategories.module';
import { PromotionApplicableProductsModule } from 'src/promotion-applicable-products/promotionApplicableProducts.module';
import { PromotionRulesModule } from 'src/promotion-rules/promotionRules.module';
import { PromotionsModule } from 'src/promotions/promotions.module';
import { CatalogController } from './adapters/inbounds/catalog.controller';
import { GetCatalogProductsUseCase } from './applications/usecases/getCatalogProducts.usecase';

@Module({
  imports: [
    ProductsModule,
    PromotionsModule,
    PromotionRulesModule,
    PromotionApplicableProductsModule,
    PromotionApplicableCategoriesModule,
    ProductCategoriesModule,
    CategoriesModule,
  ],
  controllers: [CatalogController],
  providers: [
    // Repository binding
    {
      provide: productRepositoryToken,
      useClass: ProductTypeOrmRepository,
    },
    GetCatalogProductsUseCase,
  ],
  exports: [GetCatalogProductsUseCase],
})
export class CatalogModule {}
