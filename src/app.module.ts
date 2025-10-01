import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClsModule } from 'nestjs-cls';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { configModule } from './configs/app.config';
import { httpConfig } from './configs/http.config';
import { loggerConfig } from './configs/logger.config';
import { typeormRootConfig } from './configs/typeorm.config';
import { DatabaseModule } from './databases/database.module';
import { ExpensesModule } from './expenses/expenses.module';
import { HealthModule } from './health/health.module';
import { ProductCategoriesModule } from './product-categories/productCategories.module';
import { ProductsModule } from './products/products.module';
import { PromotionApplicableCategoriesModule } from './promotion-applicable-categories/promotionApplicableCategories.module';
import { PromotionApplicableProductsModule } from './promotion-applicable-products/promotionApplicableProducts.module';
import { PromotionRulesModule } from './promotion-rules/promotionRules.module';
import { PromotionsModule } from './promotions/promotions.module';
import { UserModule } from './users/user.module';

@Module({
  imports: [
    ClsModule.forRoot(typeormRootConfig),
    ConfigModule.forRoot(configModule),
    HttpModule.register(httpConfig),
    LoggerModule.forRoot(loggerConfig),
    AuthModule,
    CategoriesModule,
    DatabaseModule,
    ExpensesModule,
    HealthModule,
    ProductCategoriesModule,
    ProductsModule,
    PromotionApplicableCategoriesModule,
    PromotionApplicableProductsModule,
    PromotionRulesModule,
    PromotionsModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
