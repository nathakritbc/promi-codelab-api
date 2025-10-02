import { faker } from '@faker-js/faker';
import { Builder } from 'builder-pattern';
import {
  CategoryId,
  CategoryName,
  CategoryTreeId,
  ICategory,
} from 'src/categories/applications/domains/category.domain';
import type { CategoryRepository } from 'src/categories/applications/ports/category.repository';
import {
  IProductCategory,
  ProductCategory,
  ProductCategoryCreatedAt,
  ProductCategoryId,
  ProductCategoryUpdatedAt,
} from 'src/product-categories/applications/domains/productCategory.domain';
import type { ProductCategoryRepository } from 'src/product-categories/applications/ports/productCategory.repository';
import {
  type IProduct,
  type ProductCode,
  type ProductId,
  type ProductName,
  type ProductPrice,
} from 'src/products/applications/domains/product.domain';
import type { ProductRepository } from 'src/products/applications/ports/product.repository';
import {
  IPromotionApplicableCategory,
  IncludeChildren,
  PromotionApplicableCategory,
  PromotionApplicableCategoryCreatedAt,
  PromotionApplicableCategoryId,
  PromotionApplicableCategoryUpdatedAt,
} from 'src/promotion-applicable-categories/applications/domains/promotionApplicableCategory.domain';
import type { PromotionApplicableCategoryRepository } from 'src/promotion-applicable-categories/applications/ports/promotionApplicableCategory.repository';
import {
  PromotionApplicableProduct,
  PromotionApplicableProductCreatedAt,
  PromotionApplicableProductId,
  PromotionApplicableProductUpdatedAt,
  type IPromotionApplicableProduct,
} from 'src/promotion-applicable-products/applications/domains/promotionApplicableProduct.domain';
import type { PromotionApplicableProductRepository } from 'src/promotion-applicable-products/applications/ports/promotionApplicableProduct.repository';
import {
  EPromotionRuleScope,
  IPromotionRule,
  PromotionRuleId,
  PromotionRuleScope,
} from 'src/promotion-rules/applications/domains/promotionRule.domain';
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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { CatalogProduct } from '../domains/catalogProduct.domain';
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

  describe('evaluateProductPromotions', () => {
    it('should evaluate product promotions successfully with active associations', async () => {
      // Arrange
      const product = createProduct();
      const catalogProduct = CatalogProduct.from(product);
      const promotionCache = new Map<string, IPromotion>();
      const promotionRulesCache = new Map<string, IPromotionRule[]>();

      const promotionId = faker.string.uuid() as PromotionId;
      const promotion = createPromotion({ uuid: promotionId });

      const mockAssociation = Builder<IPromotionApplicableProduct>()
        .uuid(faker.string.uuid() as PromotionApplicableProductId)
        .productId(product.uuid)
        .promotionId(promotionId)
        .status(EStatus.ACTIVE as Status)
        .build();

      const mockRules = [
        Builder<IPromotionRule>()
          .uuid(faker.string.uuid() as PromotionRuleId)
          .promotionId(promotionId)
          .scope(EPromotionRuleScope.PRODUCT as PromotionRuleScope)
          .build(),
      ];

      promotionApplicableProductRepository.getPromotionApplicableProductsByProductId.mockResolvedValue([
        mockAssociation,
      ]);
      promotionRepository.getPromotionById.mockResolvedValue(promotion);
      promotionRuleRepository.getPromotionRulesByPromotionId.mockResolvedValue(mockRules);

      // Act
      await useCase.evaluateProductPromotions({
        catalogProduct,
        promotionCache,
        promotionRulesCache,
      });

      // Assert
      expect(promotionApplicableProductRepository.getPromotionApplicableProductsByProductId).toHaveBeenCalledWith({
        productId: product.uuid,
      });
      expect(promotionRepository.getPromotionById).toHaveBeenCalledWith({ id: promotionId });
      expect(promotionRuleRepository.getPromotionRulesByPromotionId).toHaveBeenCalledWith({
        promotionId,
      });
    });

    it('should skip inactive associations', async () => {
      // Arrange
      const product = createProduct();
      const catalogProduct = CatalogProduct.from(product);
      const promotionCache = new Map<string, IPromotion>();
      const promotionRulesCache = new Map<string, IPromotionRule[]>();

      const promotionId = faker.string.uuid() as PromotionId;

      const mockAssociation = Builder<IPromotionApplicableProduct>()
        .uuid(faker.string.uuid() as PromotionApplicableProductId)
        .productId(product.uuid)
        .promotionId(promotionId)
        .status(EStatus.INACTIVE as Status)
        .build();

      promotionApplicableProductRepository.getPromotionApplicableProductsByProductId.mockResolvedValue([
        mockAssociation,
      ]);

      // Act
      await useCase.evaluateProductPromotions({
        catalogProduct,
        promotionCache,
        promotionRulesCache,
      });

      // Assert
      expect(promotionApplicableProductRepository.getPromotionApplicableProductsByProductId).toHaveBeenCalledWith({
        productId: product.uuid,
      });
      expect(promotionRepository.getPromotionById).not.toHaveBeenCalled();
      expect(promotionRuleRepository.getPromotionRulesByPromotionId).not.toHaveBeenCalled();
    });

    it('should handle case when promotion is not found', async () => {
      // Arrange
      const product = createProduct();
      const catalogProduct = CatalogProduct.from(product);
      const promotionCache = new Map<string, IPromotion>();
      const promotionRulesCache = new Map<string, IPromotionRule[]>();

      const promotionId = faker.string.uuid() as PromotionId;

      const mockAssociation = Builder<IPromotionApplicableProduct>()
        .uuid(faker.string.uuid() as PromotionApplicableProductId)
        .productId(product.uuid)
        .promotionId(promotionId)
        .status(EStatus.ACTIVE as Status)
        .build();

      promotionApplicableProductRepository.getPromotionApplicableProductsByProductId.mockResolvedValue([
        mockAssociation,
      ]);
      promotionRepository.getPromotionById.mockResolvedValue(undefined);

      // Act
      await useCase.evaluateProductPromotions({
        catalogProduct,
        promotionCache,
        promotionRulesCache,
      });

      // Assert
      expect(promotionApplicableProductRepository.getPromotionApplicableProductsByProductId).toHaveBeenCalledWith({
        productId: product.uuid,
      });
      expect(promotionRepository.getPromotionById).toHaveBeenCalledWith({ id: promotionId });
      expect(promotionRuleRepository.getPromotionRulesByPromotionId).not.toHaveBeenCalled();
    });

    it('should handle repository error when getting associations', async () => {
      // Arrange
      const product = createProduct();
      const catalogProduct = CatalogProduct.from(product);
      const promotionCache = new Map<string, IPromotion>();
      const promotionRulesCache = new Map<string, IPromotionRule[]>();

      const errorMessage = 'Database connection failed';
      const expectedError = new Error(errorMessage);
      promotionApplicableProductRepository.getPromotionApplicableProductsByProductId.mockRejectedValue(expectedError);

      // Act
      const promise = useCase.evaluateProductPromotions({
        catalogProduct,
        promotionCache,
        promotionRulesCache,
      });

      // Assert
      await expect(promise).rejects.toThrow(expectedError);
      expect(promotionApplicableProductRepository.getPromotionApplicableProductsByProductId).toHaveBeenCalledWith({
        productId: product.uuid,
      });
    });
  });

  describe('collectProductCategoryHierarchy', () => {
    it('should collect product category hierarchy successfully', async () => {
      // Arrange
      const productId = faker.string.uuid() as ProductId;
      const categoryCache = new Map<string, ICategory | null>();

      const categoryId1 = faker.string.uuid();
      const categoryId2 = faker.string.uuid();
      const ancestorId1 = faker.string.uuid();
      const ancestorId2 = faker.string.uuid();

      const mockProductCategory1 = Builder<IProductCategory>()
        .productId(productId)
        .categoryId(categoryId1 as CategoryId)
        .status(EStatus.ACTIVE as Status)
        .build();

      const mockProductCategory2 = Builder<IProductCategory>()
        .productId(productId)
        .categoryId(categoryId2 as CategoryId)
        .status(EStatus.ACTIVE as Status)
        .build();

      const mockCategory1 = Builder<ICategory>()
        .uuid(categoryId1 as CategoryId)
        .name(faker.commerce.department() as CategoryName)
        .ancestors([ancestorId1])
        .treeId(faker.string.uuid() as CategoryTreeId)
        .status(EStatus.ACTIVE as Status)
        .build();

      const mockCategory2 = Builder<ICategory>()
        .uuid(categoryId2 as CategoryId)
        .name(faker.commerce.department() as CategoryName)
        .ancestors([ancestorId2])
        .treeId(faker.string.uuid() as CategoryTreeId)
        .status(EStatus.ACTIVE as Status)
        .build();

      productCategoryRepository.getProductCategoriesByProductId.mockResolvedValue([
        mockProductCategory1,
        mockProductCategory2,
      ]);
      categoryRepository.getCategoryById.mockResolvedValueOnce(mockCategory1).mockResolvedValueOnce(mockCategory2);

      // Act
      const result = await useCase.collectProductCategoryHierarchy({
        productId,
        categoryCache,
      });

      // Assert
      expect(result.exactCategoryIds).toEqual(new Set([categoryId1, categoryId2]));
      expect(result.ancestorCategoryIds).toEqual(new Set([ancestorId1, ancestorId2]));
      expect(productCategoryRepository.getProductCategoriesByProductId).toHaveBeenCalledWith({
        productId,
      });
      expect(categoryRepository.getCategoryById).toHaveBeenCalledWith({ id: categoryId1 });
      expect(categoryRepository.getCategoryById).toHaveBeenCalledWith({ id: categoryId2 });
    });

    it('should skip inactive product categories', async () => {
      // Arrange
      const productId = faker.string.uuid() as ProductId;
      const categoryCache = new Map<string, ICategory | null>();

      const categoryId = faker.string.uuid();

      const mockProductCategory = Builder<IProductCategory>()
        .productId(productId)
        .categoryId(categoryId as CategoryId)
        .status(EStatus.INACTIVE as Status)
        .build();

      productCategoryRepository.getProductCategoriesByProductId.mockResolvedValue([mockProductCategory]);

      // Act
      const actual = await useCase.collectProductCategoryHierarchy({
        productId,
        categoryCache,
      });

      // Assert
      expect(actual.exactCategoryIds).toEqual(new Set());
      expect(actual.ancestorCategoryIds).toEqual(new Set());

      expect(productCategoryRepository.getProductCategoriesByProductId).toHaveBeenCalledWith({
        productId,
      });
      expect(categoryRepository.getCategoryById).not.toHaveBeenCalled();
    });

    it('should handle case when category is not found', async () => {
      // Arrange
      const productId = faker.string.uuid() as ProductId;
      const categoryCache = new Map<string, ICategory | null>();

      const categoryId = faker.string.uuid();

      const mockProductCategory = Builder<IProductCategory>()
        .productId(productId)
        .categoryId(categoryId as CategoryId)
        .status(EStatus.ACTIVE as Status)
        .build();

      productCategoryRepository.getProductCategoriesByProductId.mockResolvedValue([mockProductCategory]);
      categoryRepository.getCategoryById.mockResolvedValue(undefined);

      // Act
      const result = await useCase.collectProductCategoryHierarchy({
        productId,
        categoryCache,
      });

      // Assert
      expect(result.exactCategoryIds).toEqual(new Set([categoryId]));
      expect(result.ancestorCategoryIds).toEqual(new Set());
      expect(productCategoryRepository.getProductCategoriesByProductId).toHaveBeenCalledWith({
        productId,
      });
      expect(categoryRepository.getCategoryById).toHaveBeenCalledWith({ id: categoryId });
    });

    it('should handle repository error when getting product categories', async () => {
      // Arrange
      const productId = faker.string.uuid() as ProductId;
      const categoryCache = new Map<string, ICategory | null>();

      const errorMessage = 'Database connection failed';
      const expectedError = new Error(errorMessage);
      productCategoryRepository.getProductCategoriesByProductId.mockRejectedValue(expectedError);

      // Act
      const promise = useCase.collectProductCategoryHierarchy({
        productId,
        categoryCache,
      });

      // Assert
      await expect(promise).rejects.toThrow(expectedError);
      expect(productCategoryRepository.getProductCategoriesByProductId).toHaveBeenCalledWith({
        productId,
      });
    });
  });

  describe('evaluateCategoryPromotions', () => {
    it('should evaluate category promotions successfully with active associations', async () => {
      // Arrange
      const product = createProduct();
      const catalogProduct = CatalogProduct.from(product);
      const categoryIds = new Set([faker.string.uuid()]);
      const requireIncludeChildren = false;
      const categoryApplicablesCache = new Map<string, IPromotionApplicableCategory[]>();
      const promotionCache = new Map<string, IPromotion>();
      const promotionRulesCache = new Map<string, IPromotionRule[]>();

      const promotionId = faker.string.uuid() as PromotionId;
      const promotion = createPromotion({ uuid: promotionId });
      const categoryId = Array.from(categoryIds)[0];

      const mockAssociation = Builder<IPromotionApplicableCategory>()
        .uuid(faker.string.uuid() as PromotionApplicableCategoryId)
        .promotionId(promotionId)
        .categoryId(categoryId as CategoryId)
        .includeChildren(false as IncludeChildren)
        .status(EStatus.ACTIVE as Status)
        .build();

      const mockRules = [
        Builder<IPromotionRule>()
          .uuid(faker.string.uuid() as PromotionRuleId)
          .promotionId(promotionId)
          .scope(EPromotionRuleScope.CATEGORY as PromotionRuleScope)
          .build(),
      ];

      promotionApplicableCategoryRepository.getPromotionApplicableCategoriesByCategoryId.mockResolvedValue([
        mockAssociation,
      ]);
      promotionRepository.getPromotionById.mockResolvedValue(promotion);
      promotionRuleRepository.getPromotionRulesByPromotionId.mockResolvedValue(mockRules);

      // Act
      await useCase.evaluateCategoryPromotions({
        categoryIds,
        requireIncludeChildren,
        catalogProduct,
        categoryApplicablesCache,
        promotionCache,
        promotionRulesCache,
      });

      // Assert
      expect(promotionApplicableCategoryRepository.getPromotionApplicableCategoriesByCategoryId).toHaveBeenCalledWith({
        categoryId: categoryId as PromotionApplicableCategoryId,
      });
      expect(promotionRepository.getPromotionById).toHaveBeenCalledWith({ id: promotionId });
      expect(promotionRuleRepository.getPromotionRulesByPromotionId).toHaveBeenCalledWith({
        promotionId,
      });
    });

    it('should skip inactive associations', async () => {
      // Arrange
      const product = createProduct();
      const catalogProduct = CatalogProduct.from(product);
      const categoryIds = new Set([faker.string.uuid()]);
      const requireIncludeChildren = false;
      const categoryApplicablesCache = new Map<string, IPromotionApplicableCategory[]>();
      const promotionCache = new Map<string, IPromotion>();
      const promotionRulesCache = new Map<string, IPromotionRule[]>();

      const categoryId = Array.from(categoryIds)[0];

      const mockAssociation = Builder<IPromotionApplicableCategory>()
        .uuid(faker.string.uuid() as PromotionApplicableCategoryId)
        .promotionId(faker.string.uuid() as PromotionId)
        .categoryId(categoryId as CategoryId)
        .includeChildren(false as IncludeChildren)
        .status(EStatus.INACTIVE as Status)
        .build();

      promotionApplicableCategoryRepository.getPromotionApplicableCategoriesByCategoryId.mockResolvedValue([
        mockAssociation,
      ]);

      // Act
      await useCase.evaluateCategoryPromotions({
        categoryIds,
        requireIncludeChildren,
        catalogProduct,
        categoryApplicablesCache,
        promotionCache,
        promotionRulesCache,
      });

      // Assert
      expect(promotionApplicableCategoryRepository.getPromotionApplicableCategoriesByCategoryId).toHaveBeenCalledWith({
        categoryId: categoryId as PromotionApplicableCategoryId,
      });
      expect(promotionRepository.getPromotionById).not.toHaveBeenCalled();
      expect(promotionRuleRepository.getPromotionRulesByPromotionId).not.toHaveBeenCalled();
    });

    it('should return early when no category IDs provided', async () => {
      // Arrange
      const product = createProduct();
      const catalogProduct = CatalogProduct.from(product);
      const categoryIds = new Set<string>();
      const requireIncludeChildren = false;
      const categoryApplicablesCache = new Map<string, IPromotionApplicableCategory[]>();
      const promotionCache = new Map<string, IPromotion>();
      const promotionRulesCache = new Map<string, IPromotionRule[]>();

      // Act
      await useCase.evaluateCategoryPromotions({
        categoryIds,
        requireIncludeChildren,
        catalogProduct,
        categoryApplicablesCache,
        promotionCache,
        promotionRulesCache,
      });

      // Assert
      expect(promotionApplicableCategoryRepository.getPromotionApplicableCategoriesByCategoryId).not.toHaveBeenCalled();
      expect(promotionRepository.getPromotionById).not.toHaveBeenCalled();
      expect(promotionRuleRepository.getPromotionRulesByPromotionId).not.toHaveBeenCalled();
    });

    it('should handle repository error when getting promotion applicable categories', async () => {
      // Arrange
      const product = createProduct();
      const catalogProduct = CatalogProduct.from(product);
      const categoryIds = new Set([faker.string.uuid()]);
      const requireIncludeChildren = false;
      const categoryApplicablesCache = new Map<string, IPromotionApplicableCategory[]>();
      const promotionCache = new Map<string, IPromotion>();
      const promotionRulesCache = new Map<string, IPromotionRule[]>();

      const categoryId = Array.from(categoryIds)[0];

      const errorMessage = 'Database connection failed';
      const expectedError = new Error(errorMessage);
      promotionApplicableCategoryRepository.getPromotionApplicableCategoriesByCategoryId.mockRejectedValue(
        expectedError,
      );

      // Act
      const promise = useCase.evaluateCategoryPromotions({
        categoryIds,
        requireIncludeChildren,
        catalogProduct,
        categoryApplicablesCache,
        promotionCache,
        promotionRulesCache,
      });

      // Assert
      await expect(promise).rejects.toThrow(expectedError);
      expect(promotionApplicableCategoryRepository.getPromotionApplicableCategoriesByCategoryId).toHaveBeenCalledWith({
        categoryId: categoryId as PromotionApplicableCategoryId,
      });
    });
  });

  describe('getCategory', () => {
    it('should return category from cache when available', async () => {
      // Arrange
      const categoryId = faker.string.uuid();
      const mockCategory = Builder<ICategory>()
        .uuid(categoryId as CategoryId)
        .name(faker.commerce.department() as CategoryName)
        .ancestors([])
        .treeId(faker.string.uuid() as CategoryTreeId)
        .status(EStatus.ACTIVE as Status)
        .build();

      const cache = new Map<string, ICategory | null>();
      cache.set(categoryId, mockCategory);

      // Act
      const result = await useCase.getCategory(categoryId, cache);

      // Assert
      expect(result).toEqual(mockCategory);
      expect(categoryRepository.getCategoryById).not.toHaveBeenCalled();
    });

    it('should return null from cache when category is not found', async () => {
      // Arrange
      const categoryId = faker.string.uuid();
      const cache = new Map<string, ICategory | null>();
      cache.set(categoryId, null);

      // Act
      const result = await useCase.getCategory(categoryId, cache);

      // Assert
      expect(result).toBeNull();
      expect(categoryRepository.getCategoryById).not.toHaveBeenCalled();
    });

    it('should fetch category from repository when not in cache', async () => {
      // Arrange
      const categoryId = faker.string.uuid();
      const mockCategory = Builder<ICategory>()
        .uuid(categoryId as CategoryId)
        .name(faker.commerce.department() as CategoryName)
        .ancestors([])
        .treeId(faker.string.uuid() as CategoryTreeId)
        .status(EStatus.ACTIVE as Status)
        .build();

      const cache = new Map<string, ICategory | null>();
      categoryRepository.getCategoryById.mockResolvedValue(mockCategory);

      // Act
      const result = await useCase.getCategory(categoryId, cache);

      // Assert
      expect(result).toEqual(mockCategory);
      expect(categoryRepository.getCategoryById).toHaveBeenCalledWith({ id: categoryId });
      expect(cache.get(categoryId)).toEqual(mockCategory);
    });

    it('should cache null when category is not found in repository', async () => {
      // Arrange
      const categoryId = faker.string.uuid();
      const cache = new Map<string, ICategory | null>();
      categoryRepository.getCategoryById.mockResolvedValue(undefined);

      // Act
      const result = await useCase.getCategory(categoryId, cache);

      // Assert
      expect(result).toBeNull();
      expect(categoryRepository.getCategoryById).toHaveBeenCalledWith({ id: categoryId });
      expect(cache.get(categoryId)).toBeNull();
    });

    it('should handle repository error when getting category', async () => {
      // Arrange
      const categoryId = faker.string.uuid();
      const cache = new Map<string, ICategory | null>();

      const errorMessage = 'Database connection failed';
      const expectedError = new Error(errorMessage);
      categoryRepository.getCategoryById.mockRejectedValue(expectedError);

      // Act
      const promise = useCase.getCategory(categoryId, cache);

      // Assert
      await expect(promise).rejects.toThrow(expectedError);
      expect(categoryRepository.getCategoryById).toHaveBeenCalledWith({ id: categoryId });
    });
  });

  describe('getPromotion', () => {
    it('should return promotion from cache when available', async () => {
      // Arrange
      const promotionId = faker.string.uuid() as PromotionId;
      const mockPromotion = createPromotion({ uuid: promotionId });

      const cache = new Map<string, IPromotion>();
      cache.set(String(promotionId), mockPromotion);

      // Act
      const result = await useCase.getPromotion(promotionId, cache);

      // Assert
      expect(result).toEqual(mockPromotion);
      expect(promotionRepository.getPromotionById).not.toHaveBeenCalled();
    });

    it('should fetch promotion from repository when not in cache', async () => {
      // Arrange
      const promotionId = faker.string.uuid() as PromotionId;
      const mockPromotion = createPromotion({ uuid: promotionId });

      const cache = new Map<string, IPromotion>();
      promotionRepository.getPromotionById.mockResolvedValue(mockPromotion);

      // Act
      const result = await useCase.getPromotion(promotionId, cache);

      // Assert
      expect(result).toEqual(mockPromotion);
      expect(promotionRepository.getPromotionById).toHaveBeenCalledWith({ id: promotionId });
      expect(cache.get(String(promotionId))).toEqual(mockPromotion);
    });

    it('should return undefined when promotion is not found in repository', async () => {
      // Arrange
      const promotionId = faker.string.uuid() as PromotionId;
      const cache = new Map<string, IPromotion>();
      promotionRepository.getPromotionById.mockResolvedValue(undefined);

      // Act
      const result = await useCase.getPromotion(promotionId, cache);

      // Assert
      expect(result).toBeUndefined();
      expect(promotionRepository.getPromotionById).toHaveBeenCalledWith({ id: promotionId });
      expect(cache.has(String(promotionId))).toBe(false);
    });

    it('should handle repository error when getting promotion', async () => {
      // Arrange
      const promotionId = faker.string.uuid() as PromotionId;
      const cache = new Map<string, IPromotion>();

      const errorMessage = 'Database connection failed';
      const expectedError = new Error(errorMessage);
      promotionRepository.getPromotionById.mockRejectedValue(expectedError);

      // Act
      const promise = useCase.getPromotion(promotionId, cache);

      // Assert
      await expect(promise).rejects.toThrow(expectedError);
      expect(promotionRepository.getPromotionById).toHaveBeenCalledWith({ id: promotionId });
    });
  });

  describe('getPromotionRules', () => {
    it('should return promotion rules from cache when available', async () => {
      // Arrange
      const promotionId = faker.string.uuid() as PromotionId;
      const mockRules = [
        Builder<IPromotionRule>()
          .uuid(faker.string.uuid() as PromotionRuleId)
          .promotionId(promotionId)
          .scope(EPromotionRuleScope.PRODUCT as PromotionRuleScope)
          .build(),
      ];

      const cache = new Map<string, IPromotionRule[]>();
      cache.set(String(promotionId), mockRules);

      // Act
      const result = await useCase.getPromotionRules(promotionId, cache);

      // Assert
      expect(result).toEqual(mockRules);
      expect(promotionRuleRepository.getPromotionRulesByPromotionId).not.toHaveBeenCalled();
    });

    it('should fetch promotion rules from repository when not in cache', async () => {
      // Arrange
      const promotionId = faker.string.uuid() as PromotionId;
      const mockRules = [
        Builder<IPromotionRule>()
          .uuid(faker.string.uuid() as PromotionRuleId)
          .promotionId(promotionId)
          .scope(EPromotionRuleScope.PRODUCT as PromotionRuleScope)
          .build(),
      ];

      const cache = new Map<string, IPromotionRule[]>();
      promotionRuleRepository.getPromotionRulesByPromotionId.mockResolvedValue(mockRules);

      // Act
      const result = await useCase.getPromotionRules(promotionId, cache);

      // Assert
      expect(result).toEqual(mockRules);
      expect(promotionRuleRepository.getPromotionRulesByPromotionId).toHaveBeenCalledWith({
        promotionId,
      });
      expect(cache.get(String(promotionId))).toEqual(mockRules);
    });

    it('should return empty array when no rules found', async () => {
      // Arrange
      const promotionId = faker.string.uuid() as PromotionId;
      const cache = new Map<string, IPromotionRule[]>();
      promotionRuleRepository.getPromotionRulesByPromotionId.mockResolvedValue([]);

      // Act
      const result = await useCase.getPromotionRules(promotionId, cache);

      // Assert
      expect(result).toEqual([]);
      expect(promotionRuleRepository.getPromotionRulesByPromotionId).toHaveBeenCalledWith({
        promotionId,
      });
      expect(cache.get(String(promotionId))).toEqual([]);
    });

    it('should handle repository error when getting promotion rules', async () => {
      // Arrange
      const promotionId = faker.string.uuid() as PromotionId;
      const cache = new Map<string, IPromotionRule[]>();

      const errorMessage = 'Database connection failed';
      const expectedError = new Error(errorMessage);
      promotionRuleRepository.getPromotionRulesByPromotionId.mockRejectedValue(expectedError);

      // Act
      const promise = useCase.getPromotionRules(promotionId, cache);

      // Assert
      await expect(promise).rejects.toThrow(expectedError);
      expect(promotionRuleRepository.getPromotionRulesByPromotionId).toHaveBeenCalledWith({
        promotionId,
      });
    });
  });

  describe('getPromotionApplicableCategories', () => {
    it('should return promotion applicable categories from cache when available', async () => {
      // Arrange
      const categoryId = faker.string.uuid();
      const mockAssociations = [
        Builder<IPromotionApplicableCategory>()
          .uuid(faker.string.uuid() as PromotionApplicableCategoryId)
          .promotionId(faker.string.uuid() as PromotionId)
          .categoryId(categoryId as CategoryId)
          .includeChildren(true as IncludeChildren)
          .status(EStatus.ACTIVE as Status)
          .build(),
      ];

      const cache = new Map<string, IPromotionApplicableCategory[]>();
      cache.set(categoryId, mockAssociations);

      // Act
      const result = await useCase.getPromotionApplicableCategories(categoryId, cache);

      // Assert
      expect(result).toEqual(mockAssociations);
      expect(promotionApplicableCategoryRepository.getPromotionApplicableCategoriesByCategoryId).not.toHaveBeenCalled();
    });

    it('should fetch promotion applicable categories from repository when not in cache', async () => {
      // Arrange
      const categoryId = faker.string.uuid();
      const mockAssociations = [
        Builder<IPromotionApplicableCategory>()
          .uuid(faker.string.uuid() as PromotionApplicableCategoryId)
          .promotionId(faker.string.uuid() as PromotionId)
          .categoryId(categoryId as CategoryId)
          .includeChildren(true as IncludeChildren)
          .status(EStatus.ACTIVE as Status)
          .build(),
      ];

      const cache = new Map<string, IPromotionApplicableCategory[]>();
      promotionApplicableCategoryRepository.getPromotionApplicableCategoriesByCategoryId.mockResolvedValue(
        mockAssociations,
      );

      // Act
      const result = await useCase.getPromotionApplicableCategories(categoryId, cache);

      // Assert
      expect(result).toEqual(mockAssociations);
      expect(promotionApplicableCategoryRepository.getPromotionApplicableCategoriesByCategoryId).toHaveBeenCalledWith({
        categoryId: categoryId as CategoryId,
      });
      expect(cache.get(categoryId)).toEqual(mockAssociations);
    });

    it('should return empty array when no associations found', async () => {
      // Arrange
      const categoryId = faker.string.uuid();
      const cache = new Map<string, IPromotionApplicableCategory[]>();
      promotionApplicableCategoryRepository.getPromotionApplicableCategoriesByCategoryId.mockResolvedValue([]);

      // Act
      const result = await useCase.getPromotionApplicableCategories(categoryId, cache);

      // Assert
      expect(result).toEqual([]);
      expect(promotionApplicableCategoryRepository.getPromotionApplicableCategoriesByCategoryId).toHaveBeenCalledWith({
        categoryId: categoryId as CategoryId,
      });
      expect(cache.get(categoryId)).toEqual([]);
    });

    it('should handle repository error when getting promotion applicable categories', async () => {
      // Arrange
      const categoryId = faker.string.uuid();
      const cache = new Map<string, IPromotionApplicableCategory[]>();

      const errorMessage = 'Database connection failed';
      const expectedError = new Error(errorMessage);
      promotionApplicableCategoryRepository.getPromotionApplicableCategoriesByCategoryId.mockRejectedValue(
        expectedError,
      );

      // Act
      const promise = useCase.getPromotionApplicableCategories(categoryId, cache);

      // Assert
      await expect(promise).rejects.toThrow(expectedError);
      expect(promotionApplicableCategoryRepository.getPromotionApplicableCategoriesByCategoryId).toHaveBeenCalledWith({
        categoryId: categoryId as CategoryId,
      });
    });
  });

  describe('toPromotionApplicableProduct', () => {
    it('should convert IPromotionApplicableProduct to PromotionApplicableProduct domain object', () => {
      // Arrange
      const mockAssociation = Builder<IPromotionApplicableProduct>()
        .uuid(faker.string.uuid() as PromotionApplicableProductId)
        .promotionId(faker.string.uuid() as PromotionId)
        .productId(faker.string.uuid() as ProductId)
        .status(EStatus.ACTIVE as Status)
        .build();

      // Act
      const result = useCase.toPromotionApplicableProduct(mockAssociation);

      // Assert
      expect(result).toBeInstanceOf(PromotionApplicableProduct);
      expect(result.uuid).toBe(mockAssociation.uuid);
      expect(result.promotionId).toBe(mockAssociation.promotionId);
      expect(result.productId).toBe(mockAssociation.productId);
      expect(result.status).toBe(mockAssociation.status);
    });

    it('should handle conversion with all properties', () => {
      // Arrange
      const mockAssociation = Builder<IPromotionApplicableProduct>()
        .uuid(faker.string.uuid() as PromotionApplicableProductId)
        .promotionId(faker.string.uuid() as PromotionId)
        .productId(faker.string.uuid() as ProductId)
        .status(EStatus.ACTIVE as Status)
        .createdAt(new Date() as PromotionApplicableProductCreatedAt)
        .updatedAt(new Date() as PromotionApplicableProductUpdatedAt)
        .build();

      // Act
      const result = useCase.toPromotionApplicableProduct(mockAssociation);

      // Assert
      expect(result).toBeInstanceOf(PromotionApplicableProduct);
      expect(result.uuid).toBe(mockAssociation.uuid);
      expect(result.promotionId).toBe(mockAssociation.promotionId);
      expect(result.productId).toBe(mockAssociation.productId);
      expect(result.status).toBe(mockAssociation.status);
      expect(result.createdAt).toBe(mockAssociation.createdAt);
      expect(result.updatedAt).toBe(mockAssociation.updatedAt);
    });
  });

  describe('toPromotionApplicableCategory', () => {
    it('should convert IPromotionApplicableCategory to PromotionApplicableCategory domain object', () => {
      // Arrange
      const mockAssociation = Builder<IPromotionApplicableCategory>()
        .uuid(faker.string.uuid() as PromotionApplicableCategoryId)
        .promotionId(faker.string.uuid() as PromotionId)
        .categoryId(faker.string.uuid() as CategoryId)
        .includeChildren(true as IncludeChildren)
        .status(EStatus.ACTIVE as Status)
        .build();

      // Act
      const result = useCase.toPromotionApplicableCategory(mockAssociation);

      // Assert
      expect(result).toBeInstanceOf(PromotionApplicableCategory);
      expect(result.uuid).toBe(mockAssociation.uuid);
      expect(result.promotionId).toBe(mockAssociation.promotionId);
      expect(result.categoryId).toBe(mockAssociation.categoryId);
      expect(result.includeChildren).toBe(mockAssociation.includeChildren);
      expect(result.status).toBe(mockAssociation.status);
    });

    it('should handle conversion with all properties', () => {
      // Arrange
      const mockAssociation = Builder<IPromotionApplicableCategory>()
        .uuid(faker.string.uuid() as PromotionApplicableCategoryId)
        .promotionId(faker.string.uuid() as PromotionId)
        .categoryId(faker.string.uuid() as CategoryId)
        .includeChildren(false as IncludeChildren)
        .status(EStatus.INACTIVE as Status)
        .createdAt(new Date() as PromotionApplicableCategoryCreatedAt)
        .updatedAt(new Date() as PromotionApplicableCategoryUpdatedAt)
        .build();

      // Act
      const result = useCase.toPromotionApplicableCategory(mockAssociation);

      // Assert
      expect(result).toBeInstanceOf(PromotionApplicableCategory);
      expect(result.uuid).toBe(mockAssociation.uuid);
      expect(result.promotionId).toBe(mockAssociation.promotionId);
      expect(result.categoryId).toBe(mockAssociation.categoryId);
      expect(result.includeChildren).toBe(mockAssociation.includeChildren);
      expect(result.status).toBe(mockAssociation.status);
      expect(result.createdAt).toBe(mockAssociation.createdAt);
      expect(result.updatedAt).toBe(mockAssociation.updatedAt);
    });
  });

  describe('toProductCategory', () => {
    it('should convert IProductCategory to ProductCategory domain object', () => {
      // Arrange
      const mockProductCategory = Builder<IProductCategory>()
        .uuid(faker.string.uuid() as ProductCategoryId)
        .productId(faker.string.uuid() as ProductId)
        .categoryId(faker.string.uuid() as CategoryId)
        .status(EStatus.ACTIVE as Status)
        .build();

      // Act
      const result = useCase.toProductCategory(mockProductCategory);

      // Assert
      expect(result).toBeInstanceOf(ProductCategory);
      expect(result.uuid).toBe(mockProductCategory.uuid);
      expect(result.productId).toBe(mockProductCategory.productId);
      expect(result.categoryId).toBe(mockProductCategory.categoryId);
      expect(result.status).toBe(mockProductCategory.status);
    });

    it('should handle conversion with all properties', () => {
      // Arrange
      const mockProductCategory = Builder<IProductCategory>()
        .uuid(faker.string.uuid() as ProductCategoryId)
        .productId(faker.string.uuid() as ProductId)
        .categoryId(faker.string.uuid() as CategoryId)
        .status(EStatus.ACTIVE as Status)
        .createdAt(new Date() as ProductCategoryCreatedAt)
        .updatedAt(new Date() as ProductCategoryUpdatedAt)
        .build();

      // Act
      const result = useCase.toProductCategory(mockProductCategory);

      // Assert
      expect(result).toBeInstanceOf(ProductCategory);
      expect(result.uuid).toBe(mockProductCategory.uuid);
      expect(result.productId).toBe(mockProductCategory.productId);
      expect(result.categoryId).toBe(mockProductCategory.categoryId);
      expect(result.status).toBe(mockProductCategory.status);
      expect(result.createdAt).toBe(mockProductCategory.createdAt);
      expect(result.updatedAt).toBe(mockProductCategory.updatedAt);
    });
  });
});
