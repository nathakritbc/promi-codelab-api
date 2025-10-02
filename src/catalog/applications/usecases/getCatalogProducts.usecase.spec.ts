import { Builder } from 'builder-pattern';
import type { ICategory } from 'src/categories/applications/domains/category.domain';
import { Category } from 'src/categories/applications/domains/category.domain';
import type { CategoryRepository } from 'src/categories/applications/ports/category.repository';
import type { IProductCategory } from 'src/product-categories/applications/domains/productCategory.domain';
import type { ProductCategoryRepository } from 'src/product-categories/applications/ports/productCategory.repository';
import {
  type IProduct,
  type ProductCode,
  type ProductId,
  type ProductName,
  type ProductPrice,
} from 'src/products/applications/domains/product.domain';
import type { ProductRepository } from 'src/products/applications/ports/product.repository';
import type { IPromotionApplicableCategory } from 'src/promotion-applicable-categories/applications/domains/promotionApplicableCategory.domain';
import type { PromotionApplicableCategoryRepository } from 'src/promotion-applicable-categories/applications/ports/promotionApplicableCategory.repository';
import type { IPromotionApplicableProduct } from 'src/promotion-applicable-products/applications/domains/promotionApplicableProduct.domain';
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
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EPromotionOfferSource } from '../domains/catalogProduct.domain';
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
  let productRepository: ProductRepository;
  let promotionApplicableProductRepository: PromotionApplicableProductRepository;
  let promotionApplicableCategoryRepository: PromotionApplicableCategoryRepository;
  let productCategoryRepository: ProductCategoryRepository;
  let categoryRepository: CategoryRepository;
  let promotionRepository: PromotionRepository;
  let promotionRuleRepository: PromotionRuleRepository;
  let useCase: GetCatalogProductsUseCase;

  beforeEach(() => {
    productRepository = {
      getAllProducts: vi.fn().mockResolvedValue({
        result: [createProduct()],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      }),
    } as unknown as ProductRepository;

    promotionApplicableProductRepository = {
      getPromotionApplicableProductsByProductId: vi.fn().mockResolvedValue([
        Builder<IPromotionApplicableProduct>()
          .uuid('pap-1')
          .promotionId('promo-fixed' as PromotionId)
          .productId('product-1' as ProductId)
          .status(EStatus.ACTIVE as Status)
          .build(),
      ]),
    } as unknown as PromotionApplicableProductRepository;

    promotionApplicableCategoryRepository = {
      getPromotionApplicableCategoriesByCategoryId: vi.fn((params: { categoryId: string }) => {
        if (params.categoryId === 'cat-computer') {
          return Promise.resolve([
            Builder<IPromotionApplicableCategory>()
              .uuid('pac-ancestor')
              .promotionId('promo-percent' as PromotionId)
              .categoryId('cat-computer')
              .includeChildren(true)
              .status(EStatus.ACTIVE as Status)
              .build(),
          ]);
        }

        if (params.categoryId === 'cat-keyboard') {
          return Promise.resolve([
            Builder<IPromotionApplicableCategory>()
              .uuid('pac-keyboard')
              .promotionId('promo-keyboard' as PromotionId)
              .categoryId('cat-keyboard')
              .includeChildren(false)
              .status(EStatus.ACTIVE as Status)
              .build(),
          ]);
        }

        return Promise.resolve([]);
      }),
    } as unknown as PromotionApplicableCategoryRepository;

    productCategoryRepository = {
      getProductCategoriesByProductId: vi.fn().mockResolvedValue([
        Builder<IProductCategory>()
          .uuid('pc-1')
          .productId('product-1' as ProductId)
          .categoryId('cat-keyboard')
          .status(EStatus.ACTIVE as Status)
          .build(),
      ]),
    } as unknown as ProductCategoryRepository;

    categoryRepository = {
      getCategoryById: vi.fn(({ id }: { id: string }) => {
        if (id === 'cat-keyboard') {
          return Promise.resolve(
            Object.assign(
              new Category(),
              Builder<ICategory>()
                .uuid('cat-keyboard')
                .name('Keyboard')
                .status(EStatus.ACTIVE as Status)
                .ancestors(['cat-computer'])
                .treeId('tree-1')
                .build(),
            ),
          );
        }

        if (id === 'cat-computer') {
          return Promise.resolve(
            Object.assign(
              new Category(),
              Builder<ICategory>()
                .uuid('cat-computer')
                .name('Computer')
                .status(EStatus.ACTIVE as Status)
                .ancestors([])
                .treeId('tree-1')
                .build(),
            ),
          );
        }

        return Promise.resolve(null);
      }),
    } as unknown as CategoryRepository;

    const promotionsMap: Record<string, IPromotion> = {
      'promo-fixed': createPromotion(),
      'promo-percent': createPromotion({
        uuid: 'promo-percent' as PromotionId,
        name: 'Category Percent' as PromotionName,
        discountType: EDiscountType.PERCENT as DiscountType,
        discountValue: 20 as PromotionDiscountValue,
        priority: 5 as PromotionPriority,
      }),
      'promo-keyboard': createPromotion({
        uuid: 'promo-keyboard' as PromotionId,
        name: 'Keyboard Bonus' as PromotionName,
        discountType: EDiscountType.FIXED as DiscountType,
        discountValue: 50 as PromotionDiscountValue,
        priority: 2 as PromotionPriority,
      }),
    };

    promotionRepository = {
      getPromotionById: vi.fn(({ id }: { id: PromotionId }) => Promise.resolve(promotionsMap[String(id)])),
    } as unknown as PromotionRepository;

    promotionRuleRepository = {
      getPromotionRulesByPromotionId: vi.fn().mockResolvedValue([]),
    } as unknown as PromotionRuleRepository;

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

  it('should return catalog product with best applicable promotion from category hierarchy', async () => {
    const result = await useCase.execute({});

    expect(result.meta.total).toBe(1);
    expect(result.result).toHaveLength(1);

    const catalogProduct = result.result[0];

    expect(catalogProduct.appliedPromotion?.promotionId).toBe('promo-percent');
    expect(catalogProduct.appliedPromotion?.discountAmount).toBeCloseTo(200);
    expect(catalogProduct.finalPrice).toBeCloseTo(800);
    expect(catalogProduct.appliedPromotion?.source).toBe(EPromotionOfferSource.CATEGORY);
    expect(catalogProduct.appliedPromotion?.metadata?.includeChildren).toBe(true);
    expect(promotionApplicableCategoryRepository.getPromotionApplicableCategoriesByCategoryId).toHaveBeenCalledWith({
      categoryId: 'cat-keyboard',
    });
    expect(promotionApplicableCategoryRepository.getPromotionApplicableCategoriesByCategoryId).toHaveBeenCalledWith({
      categoryId: 'cat-computer',
    });
  });
});
