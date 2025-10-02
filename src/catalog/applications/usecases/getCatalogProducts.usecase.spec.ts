import { Builder } from 'builder-pattern';
import type { CategoryRepository } from 'src/categories/applications/ports/category.repository';
import type { ProductCategoryRepository } from 'src/product-categories/applications/ports/productCategory.repository';
import {
  type IProduct,
  type ProductCode,
  type ProductId,
  type ProductName,
  type ProductPrice,
} from 'src/products/applications/domains/product.domain';
import type { ProductRepository } from 'src/products/applications/ports/product.repository';
import type { PromotionApplicableCategoryRepository } from 'src/promotion-applicable-categories/applications/ports/promotionApplicableCategory.repository';
import type { PromotionApplicableProductRepository } from 'src/promotion-applicable-products/applications/ports/promotionApplicableProduct.repository';
import type { PromotionRuleRepository } from 'src/promotion-rules/applications/ports/promotionRule.repository';
import {
  EDiscountType,
  EPromotionStatus,
  Promotion,
  type DiscountType,
  type IPromotion,
  type PromotionDiscountValue,
  type PromotionEndsAt,
  type PromotionId,
  type PromotionName,
  type PromotionPriority,
  type PromotionStartsAt,
  type PromotionStatus,
} from 'src/promotions/applications/domains/promotion.domain';
import type { PromotionRepository } from 'src/promotions/applications/ports/promotion.repository';
import { EStatus, type Status } from 'src/types/utility.type';
import { beforeEach, describe, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { GetCatalogProductsUseCase } from './getCatalogProducts.usecase';

const createProduct = (): IProduct => {
  return Builder<IProduct>()
    .uuid('product-1' as ProductId)
    .code('P001' as ProductCode)
    .name('Gaming Keyboard' as ProductName)
    .price(1000 as ProductPrice)
    .status(EStatus.ACTIVE as Status)
    .build();
};

const createPromotion = (overrides: Partial<IPromotion> = {}): IPromotion => {
  const now = new Date();
  const basePromotion = Builder<IPromotion>()
    .uuid('promo-fixed' as PromotionId)
    .name('Fixed Discount' as PromotionName)
    .status(EPromotionStatus.ACTIVE as PromotionStatus)
    .startsAt(new Date(now.getTime() - 60_000) as PromotionStartsAt)
    .endsAt(new Date(now.getTime() + 60_000) as PromotionEndsAt)
    .discountType(EDiscountType.FIXED as DiscountType)
    .discountValue(100 as PromotionDiscountValue)
    .priority(1 as PromotionPriority)
    .build();

  return Object.assign(new Promotion(), basePromotion, overrides);
};

describe('GetCatalogProductsUseCase', () => {
  const productRepository = mock<ProductRepository>();
  const promotionApplicableProductRepository = mock<PromotionApplicableProductRepository>();
  const promotionApplicableCategoryRepository = mock<PromotionApplicableCategoryRepository>();
  const productCategoryRepository = mock<ProductCategoryRepository>();
  const categoryRepository = mock<CategoryRepository>();
  const promotionRepository = mock<PromotionRepository>();
  const promotionRuleRepository = mock<PromotionRuleRepository>();
  let useCase: GetCatalogProductsUseCase;

  beforeEach(() => {
    useCase = new GetCatalogProductsUseCase(
      productRepository,
      promotionApplicableProductRepository,
      promotionApplicableCategoryRepository,
      productCategoryRepository,
      categoryRepository,
      promotionRepository,
      promotionRuleRepository,
    );
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('evaluateProductPromotions', () => {});

  describe('collectProductCategoryHierarchy', () => {});

  describe('evaluateCategoryPromotions', () => {});

  describe('getCategory', () => {});

  describe('getPromotion', () => {});

  describe('getPromotionRules', () => {});

  describe('getPromotionApplicableCategories', () => {});

  describe('toPromotionApplicableProduct', () => {});

  describe('toPromotionApplicableCategory', () => {});

  describe('toProductCategory', () => {});
});
