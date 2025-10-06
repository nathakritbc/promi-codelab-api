import { Inject, Injectable } from '@nestjs/common';
import { Builder, StrictBuilder } from 'builder-pattern';
import type { CategoryId, ICategory } from 'src/categories/applications/domains/category.domain';
import { Category } from 'src/categories/applications/domains/category.domain';
import type { CategoryRepository } from 'src/categories/applications/ports/category.repository';
import { categoryRepositoryToken } from 'src/categories/applications/ports/category.repository';
import {
  ProductCategory,
  type IProductCategory,
} from 'src/product-categories/applications/domains/productCategory.domain';
import type { ProductCategoryRepository } from 'src/product-categories/applications/ports/productCategory.repository';
import { productCategoryRepositoryToken } from 'src/product-categories/applications/ports/productCategory.repository';
import { IProduct } from 'src/products/applications/domains/product.domain';
import type { ProductRepository } from 'src/products/applications/ports/product.repository';
import { GetAllProductsQuery, productRepositoryToken } from 'src/products/applications/ports/product.repository';
import {
  PromotionApplicableCategory,
  type IPromotionApplicableCategory,
  type CategoryId as PromotionApplicableCategoryId,
} from 'src/promotion-applicable-categories/applications/domains/promotionApplicableCategory.domain';
import type { PromotionApplicableCategoryRepository } from 'src/promotion-applicable-categories/applications/ports/promotionApplicableCategory.repository';
import { promotionApplicableCategoryRepositoryToken } from 'src/promotion-applicable-categories/applications/ports/promotionApplicableCategory.repository';
import {
  IPromotionApplicableProduct,
  PromotionApplicableProduct,
} from 'src/promotion-applicable-products/applications/domains/promotionApplicableProduct.domain';
import type { PromotionApplicableProductRepository } from 'src/promotion-applicable-products/applications/ports/promotionApplicableProduct.repository';
import { promotionApplicableProductRepositoryToken } from 'src/promotion-applicable-products/applications/ports/promotionApplicableProduct.repository';
import type { IPromotionRule } from 'src/promotion-rules/applications/domains/promotionRule.domain';
import type { PromotionRuleRepository } from 'src/promotion-rules/applications/ports/promotionRule.repository';
import { promotionRuleRepositoryToken } from 'src/promotion-rules/applications/ports/promotionRule.repository';
import type { IPromotion, PromotionId } from 'src/promotions/applications/domains/promotion.domain';
import type { PromotionRepository } from 'src/promotions/applications/ports/promotion.repository';
import { promotionRepositoryToken } from 'src/promotions/applications/ports/promotion.repository';
import type { GetAllMetaType } from 'src/types/utility.type';
import { CatalogProduct, EPromotionOfferSource, type CatalogProductSnapshot } from '../domains/catalogProduct.domain';

// Types for better organization
interface CacheCollections {
  categoryCache: Map<string, ICategory | null>;
  categoryApplicablesCache: Map<string, IPromotionApplicableCategory[]>;
  promotionCache: Map<string, IPromotion>;
  promotionRulesCache: Map<string, IPromotionRule[]>;
}

interface ProductCategoryHierarchy {
  exactCategoryIds: Set<string>;
  ancestorCategoryIds: Set<string>;
}

export type GetCatalogProductsQuery = GetAllProductsQuery;

export interface GetCatalogProductsReturnType {
  result: CatalogProductSnapshot[];
  meta: GetAllMetaType;
}

interface EvaluateCategoryPromotionsParams {
  categoryIds: Set<string>;
  requireIncludeChildren: boolean;
  catalogProduct: CatalogProduct;
  categoryApplicablesCache: Map<string, IPromotionApplicableCategory[]>;
  promotionCache: Map<string, IPromotion>;
  promotionRulesCache: Map<string, IPromotionRule[]>;
}

@Injectable()
export class GetCatalogProductsUseCase {
  constructor(
    @Inject(productRepositoryToken)
    private readonly productRepository: ProductRepository,
    @Inject(promotionApplicableProductRepositoryToken)
    private readonly promotionApplicableProductRepository: PromotionApplicableProductRepository,
    @Inject(promotionApplicableCategoryRepositoryToken)
    private readonly promotionApplicableCategoryRepository: PromotionApplicableCategoryRepository,
    @Inject(productCategoryRepositoryToken)
    private readonly productCategoryRepository: ProductCategoryRepository,
    @Inject(categoryRepositoryToken)
    private readonly categoryRepository: CategoryRepository,
    @Inject(promotionRepositoryToken)
    private readonly promotionRepository: PromotionRepository,
    @Inject(promotionRuleRepositoryToken)
    private readonly promotionRuleRepository: PromotionRuleRepository,
  ) {}

  /**
   * Execute the main use case to get catalog products with promotions applied
   */
  async execute(query: GetCatalogProductsQuery): Promise<GetCatalogProductsReturnType> {
    const { result: products, meta } = await this.productRepository.getAllProducts(query);

    const caches = this.initializeCaches();
    const catalogResults = await this.processProducts(products, caches);

    return StrictBuilder<GetCatalogProductsReturnType>().result(catalogResults).meta(meta).build();
  }

  /**
   * Initialize all cache collections for performance optimization
   */
  private initializeCaches(): CacheCollections {
    return {
      categoryCache: new Map<string, ICategory | null>(),
      categoryApplicablesCache: new Map<string, IPromotionApplicableCategory[]>(),
      promotionCache: new Map<string, IPromotion>(),
      promotionRulesCache: new Map<string, IPromotionRule[]>(),
    };
  }

  /**
   * Process all products and apply promotions
   */
  private async processProducts(products: IProduct[], caches: CacheCollections): Promise<CatalogProductSnapshot[]> {
    return Promise.all(products.map((product) => this.processSingleProduct({ product, caches })));
  }

  /**
   * Process a single product: create catalog product and apply all promotions
   */
  private async processSingleProduct({
    product,
    caches,
  }: {
    product: IProduct;
    caches: CacheCollections;
  }): Promise<CatalogProductSnapshot> {
    const catalogProduct = CatalogProduct.from(product);

    // Apply product-specific promotions
    await this.evaluateProductPromotions({
      catalogProduct,
      promotionCache: caches.promotionCache,
      promotionRulesCache: caches.promotionRulesCache,
    });

    // Collect category hierarchy for this product
    const categoryHierarchy = await this.collectProductCategoryHierarchy({
      productId: product.uuid,
      categoryCache: caches.categoryCache,
    });

    // Apply category promotions (exact categories)
    await this.evaluateCategoryPromotions({
      categoryIds: categoryHierarchy.exactCategoryIds,
      requireIncludeChildren: false,
      catalogProduct,
      categoryApplicablesCache: caches.categoryApplicablesCache,
      promotionCache: caches.promotionCache,
      promotionRulesCache: caches.promotionRulesCache,
    });

    // Apply category promotions (ancestor categories)
    await this.evaluateCategoryPromotions({
      categoryIds: categoryHierarchy.ancestorCategoryIds,
      requireIncludeChildren: true,
      catalogProduct,
      categoryApplicablesCache: caches.categoryApplicablesCache,
      promotionCache: caches.promotionCache,
      promotionRulesCache: caches.promotionRulesCache,
    });

    return catalogProduct.toSnapshot();
  }

  /**
   * Evaluate and apply product-specific promotions
   */
  public async evaluateProductPromotions({
    catalogProduct,
    promotionCache,
    promotionRulesCache,
  }: {
    catalogProduct: CatalogProduct;
    promotionCache: Map<string, IPromotion>;
    promotionRulesCache: Map<string, IPromotionRule[]>;
  }): Promise<void> {
    const product = catalogProduct.getProduct();
    const associations = await this.promotionApplicableProductRepository.getPromotionApplicableProductsByProductId({
      productId: product.uuid,
    });

    const activeAssociations = this.filterActiveProductAssociations(associations);

    await this.applyProductPromotions({
      catalogProduct,
      activeAssociations,
      promotionCache,
      promotionRulesCache,
    });
  }

  /**
   * Filter and convert product associations to active domain objects
   */
  private filterActiveProductAssociations(associations: IPromotionApplicableProduct[]): PromotionApplicableProduct[] {
    return associations
      .map((association) => this.toPromotionApplicableProduct(association))
      .filter((association) => association.isActive());
  }

  /**
   * Apply promotions to a catalog product
   */
  private async applyProductPromotions({
    catalogProduct,
    activeAssociations,
    promotionCache,
    promotionRulesCache,
  }: {
    catalogProduct: CatalogProduct;
    activeAssociations: PromotionApplicableProduct[];
    promotionCache: Map<string, IPromotion>;
    promotionRulesCache: Map<string, IPromotionRule[]>;
  }): Promise<void> {
    for (const association of activeAssociations) {
      const promotion = await this.getPromotion({
        promotionId: association.promotionId,
        cache: promotionCache,
      });
      if (!promotion) continue;

      const rules = await this.getPromotionRules({
        promotionId: association.promotionId,
        cache: promotionRulesCache,
      });

      catalogProduct.evaluatePromotion({
        promotion,
        rules,
        source: EPromotionOfferSource.PRODUCT,
        metadata: {
          associationId: association.uuid,
        },
      });
    }
  }

  /**
   * Collect product category hierarchy including exact categories and their ancestors
   */
  public async collectProductCategoryHierarchy({
    productId,
    categoryCache,
  }: {
    productId: ProductCategory['productId'];
    categoryCache: Map<string, ICategory | null>;
  }): Promise<ProductCategoryHierarchy> {
    const productCategories = await this.productCategoryRepository.getProductCategoriesByProductId({
      productId,
    });

    const activeProductCategories = this.filterActiveProductCategories(productCategories);

    return this.buildCategoryHierarchy({
      activeProductCategories,
      categoryCache,
    });
  }

  /**
   * Filter and convert product categories to active domain objects
   */
  private filterActiveProductCategories(productCategories: IProductCategory[]): ProductCategory[] {
    return productCategories
      .map((productCategory) => this.toProductCategory(productCategory))
      .filter((productCategory) => productCategory.isActive());
  }

  /**
   * Build category hierarchy from active product categories
   */
  private async buildCategoryHierarchy({
    activeProductCategories,
    categoryCache,
  }: {
    activeProductCategories: ProductCategory[];
    categoryCache: Map<string, ICategory | null>;
  }): Promise<ProductCategoryHierarchy> {
    const exactCategoryIds = new Set<string>();
    const ancestorCategoryIds = new Set<string>();

    for (const productCategory of activeProductCategories) {
      const categoryId = String(productCategory.categoryId);
      exactCategoryIds.add(categoryId);

      await this.collectAncestorCategories({
        categoryId,
        ancestorCategoryIds,
        categoryCache,
      });
    }

    return { exactCategoryIds, ancestorCategoryIds };
  }

  /**
   * Collect ancestor categories for a given category
   */
  private async collectAncestorCategories({
    categoryId,
    ancestorCategoryIds,
    categoryCache,
  }: {
    categoryId: string;
    ancestorCategoryIds: Set<string>;
    categoryCache: Map<string, ICategory | null>;
  }): Promise<void> {
    const category = await this.getCategory({
      categoryId,
      cache: categoryCache,
    });
    if (category && Array.isArray(category.ancestors)) {
      category.ancestors.forEach((ancestorId) => ancestorCategoryIds.add(ancestorId));
    }
  }

  /**
   * Evaluate and apply category-specific promotions
   */
  public async evaluateCategoryPromotions(params: EvaluateCategoryPromotionsParams): Promise<void> {
    const {
      categoryIds,
      requireIncludeChildren,
      catalogProduct,
      categoryApplicablesCache,
      promotionCache,
      promotionRulesCache,
    } = params;

    if (!categoryIds.size) return;

    for (const categoryId of categoryIds) {
      await this.processCategoryPromotions({
        categoryId,
        requireIncludeChildren,
        catalogProduct,
        categoryApplicablesCache,
        promotionCache,
        promotionRulesCache,
      });
    }
  }

  /**
   * Process promotions for a specific category
   */
  private async processCategoryPromotions({
    categoryId,
    requireIncludeChildren,
    catalogProduct,
    categoryApplicablesCache,
    promotionCache,
    promotionRulesCache,
  }: {
    categoryId: string;
    requireIncludeChildren: boolean;
    catalogProduct: CatalogProduct;
    categoryApplicablesCache: Map<string, IPromotionApplicableCategory[]>;
    promotionCache: Map<string, IPromotion>;
    promotionRulesCache: Map<string, IPromotionRule[]>;
  }): Promise<void> {
    const associations = await this.getPromotionApplicableCategories({
      categoryId,
      cache: categoryApplicablesCache,
    });
    if (!associations.length) return;

    const activeAssociations = this.filterActiveCategoryAssociations({
      associations,
      requireIncludeChildren,
    });
    if (!activeAssociations.length) return;

    await this.applyCategoryPromotions({
      catalogProduct,
      activeAssociations,
      promotionCache,
      promotionRulesCache,
    });
  }

  /**
   * Filter and convert category associations to active domain objects
   */
  private filterActiveCategoryAssociations({
    associations,
    requireIncludeChildren,
  }: {
    associations: IPromotionApplicableCategory[];
    requireIncludeChildren: boolean;
  }): PromotionApplicableCategory[] {
    return associations
      .map((association) => this.toPromotionApplicableCategory(association))
      .filter((association) => {
        if (!association.isActive()) return false;

        if (requireIncludeChildren) return association.shouldIncludeChildren();

        return true;
      });
  }

  /**
   * Apply category promotions to a catalog product
   */
  private async applyCategoryPromotions({
    catalogProduct,
    activeAssociations,
    promotionCache,
    promotionRulesCache,
  }: {
    catalogProduct: CatalogProduct;
    activeAssociations: PromotionApplicableCategory[];
    promotionCache: Map<string, IPromotion>;
    promotionRulesCache: Map<string, IPromotionRule[]>;
  }): Promise<void> {
    for (const association of activeAssociations) {
      const promotion = await this.getPromotion({
        promotionId: association.promotionId,
        cache: promotionCache,
      });
      if (!promotion) continue;

      const rules = await this.getPromotionRules({
        promotionId: association.promotionId,
        cache: promotionRulesCache,
      });

      catalogProduct.evaluatePromotion({
        promotion,
        rules,
        source: EPromotionOfferSource.CATEGORY,
        metadata: {
          associationId: association.uuid,
          appliedCategoryId: association.categoryId,
          includeChildren: association.shouldIncludeChildren(),
        },
      });
    }
  }

  // Cache management methods with improved error handling and documentation

  /**
   * Get category with caching support
   */
  public async getCategory({
    categoryId,
    cache,
  }: {
    categoryId: string;
    cache: Map<string, ICategory | null>;
  }): Promise<ICategory | null> {
    if (cache.has(categoryId)) {
      return cache.get(categoryId) ?? null;
    }

    const category = await this.categoryRepository.getCategoryById({ id: categoryId as CategoryId });
    const domainCategory = category ? (Object.assign(new Category(), category) as ICategory) : null;

    cache.set(categoryId, domainCategory);
    return domainCategory;
  }

  /**
   * Get promotion with caching support
   */
  public async getPromotion({
    promotionId,
    cache,
  }: {
    promotionId: PromotionId;
    cache: Map<string, IPromotion>;
  }): Promise<IPromotion | undefined> {
    const key = String(promotionId);
    if (cache.has(key)) {
      return cache.get(key);
    }

    const promotion = await this.promotionRepository.getPromotionById({ id: promotionId });
    if (promotion) cache.set(key, promotion);

    return promotion ?? undefined;
  }

  /**
   * Get promotion rules with caching support
   */
  public async getPromotionRules({
    promotionId,
    cache,
  }: {
    promotionId: PromotionId;
    cache: Map<string, IPromotionRule[]>;
  }): Promise<IPromotionRule[]> {
    const key = String(promotionId);
    if (cache.has(key)) {
      return cache.get(key) ?? [];
    }

    const rules = await this.promotionRuleRepository.getPromotionRulesByPromotionId({
      promotionId,
    });

    cache.set(key, rules);
    return rules ?? [];
  }

  /**
   * Get promotion applicable categories with caching support
   */
  public async getPromotionApplicableCategories({
    categoryId,
    cache,
  }: {
    categoryId: string;
    cache: Map<string, IPromotionApplicableCategory[]>;
  }): Promise<IPromotionApplicableCategory[]> {
    if (cache.has(categoryId)) {
      return cache.get(categoryId) ?? [];
    }

    const associations = await this.promotionApplicableCategoryRepository.getPromotionApplicableCategoriesByCategoryId({
      categoryId: categoryId as PromotionApplicableCategoryId,
    });

    cache.set(categoryId, associations ?? []);
    return associations ?? [];
  }

  // Domain object conversion methods

  /**
   * Convert repository object to PromotionApplicableProduct domain object
   */
  public toPromotionApplicableProduct(association: IPromotionApplicableProduct): PromotionApplicableProduct {
    return Builder(PromotionApplicableProduct)
      .uuid(association.uuid)
      .promotionId(association.promotionId)
      .productId(association.productId)
      .status(association.status)
      .createdAt(association.createdAt)
      .updatedAt(association.updatedAt)
      .build();
  }

  /**
   * Convert repository object to PromotionApplicableCategory domain object
   */
  public toPromotionApplicableCategory(association: IPromotionApplicableCategory): PromotionApplicableCategory {
    return Builder(PromotionApplicableCategory)
      .uuid(association.uuid)
      .promotionId(association.promotionId)
      .categoryId(association.categoryId)
      .includeChildren(association.includeChildren)
      .status(association.status)
      .createdAt(association.createdAt)
      .updatedAt(association.updatedAt)
      .build();
  }

  /**
   * Convert repository object to ProductCategory domain object
   */
  public toProductCategory(productCategory: IProductCategory): ProductCategory {
    return Builder(ProductCategory)
      .uuid(productCategory.uuid)
      .productId(productCategory.productId)
      .categoryId(productCategory.categoryId)
      .status(productCategory.status)
      .createdAt(productCategory.createdAt)
      .updatedAt(productCategory.updatedAt)
      .build();
  }
}
