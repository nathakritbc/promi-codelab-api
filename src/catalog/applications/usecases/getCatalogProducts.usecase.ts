import { Inject, Injectable } from '@nestjs/common';
import { StrictBuilder } from 'builder-pattern';
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

  async execute(query: GetCatalogProductsQuery): Promise<GetCatalogProductsReturnType> {
    const { result: products, meta } = await this.productRepository.getAllProducts(query);

    const categoryCache = new Map<string, ICategory | null>();
    const categoryApplicablesCache = new Map<string, IPromotionApplicableCategory[]>();
    const promotionCache = new Map<string, IPromotion>();
    const promotionRulesCache = new Map<string, IPromotionRule[]>();

    const catalogResults: CatalogProductSnapshot[] = [];

    for (const product of products) {
      const catalogProduct = CatalogProduct.from(product);

      await this.evaluateProductPromotions({
        catalogProduct,
        promotionCache,
        promotionRulesCache,
      });

      const { exactCategoryIds, ancestorCategoryIds } = await this.collectProductCategoryHierarchy({
        productId: product.uuid,
        categoryCache,
      });

      await this.evaluateCategoryPromotions({
        categoryIds: exactCategoryIds,
        requireIncludeChildren: false,
        catalogProduct,
        categoryApplicablesCache,
        promotionCache,
        promotionRulesCache,
      });

      await this.evaluateCategoryPromotions({
        categoryIds: ancestorCategoryIds,
        requireIncludeChildren: true,
        catalogProduct,
        categoryApplicablesCache,
        promotionCache,
        promotionRulesCache,
      });

      catalogResults.push(catalogProduct.toSnapshot());
    }

    return StrictBuilder<GetCatalogProductsReturnType>().result(catalogResults).meta(meta).build();
  }

  private async evaluateProductPromotions({
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

    const activeAssociations = associations
      .map((association) => this.toPromotionApplicableProduct(association))
      .filter((association) => association.isActive());

    for (const association of activeAssociations) {
      const promotion = await this.getPromotion(association.promotionId, promotionCache);
      if (!promotion) continue;

      const rules = await this.getPromotionRules(association.promotionId, promotionRulesCache);

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

  private async collectProductCategoryHierarchy({
    productId,
    categoryCache,
  }: {
    productId: ProductCategory['productId'];
    categoryCache: Map<string, ICategory | null>;
  }): Promise<{ exactCategoryIds: Set<string>; ancestorCategoryIds: Set<string> }> {
    const productCategories = await this.productCategoryRepository.getProductCategoriesByProductId({
      productId,
    });

    const activeProductCategories = productCategories
      .map((productCategory) => this.toProductCategory(productCategory))
      .filter((productCategory) => productCategory.isActive());

    const exactCategoryIds = new Set<string>();
    const ancestorCategoryIds = new Set<string>();

    for (const productCategory of activeProductCategories) {
      const categoryId = String(productCategory.categoryId);
      exactCategoryIds.add(categoryId);

      const category = await this.getCategory(categoryId, categoryCache);
      if (category && Array.isArray(category.ancestors)) {
        category.ancestors.forEach((ancestorId) => ancestorCategoryIds.add(ancestorId));
      }
    }

    return { exactCategoryIds, ancestorCategoryIds };
  }

  private async evaluateCategoryPromotions(params: EvaluateCategoryPromotionsParams): Promise<void> {
    const {
      categoryIds,
      requireIncludeChildren,
      catalogProduct,
      categoryApplicablesCache,
      promotionCache,
      promotionRulesCache,
    } = params;

    if (!categoryIds.size) {
      return;
    }

    for (const categoryId of categoryIds) {
      const associations = await this.getPromotionApplicableCategories(categoryId, categoryApplicablesCache);
      if (!associations.length) {
        continue;
      }

      const activeAssociations = associations
        .map((association) => this.toPromotionApplicableCategory(association))
        .filter((association) => {
          if (!association.isActive()) {
            return false;
          }

          if (requireIncludeChildren) {
            return association.shouldIncludeChildren();
          }

          return true;
        });

      if (!activeAssociations.length) {
        continue;
      }

      for (const association of activeAssociations) {
        const promotion = await this.getPromotion(association.promotionId, promotionCache);
        if (!promotion) continue;

        const rules = await this.getPromotionRules(association.promotionId, promotionRulesCache);

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
  }

  private async getCategory(categoryId: string, cache: Map<string, ICategory | null>): Promise<ICategory | null> {
    if (cache.has(categoryId)) {
      return cache.get(categoryId) ?? null;
    }

    const category = await this.categoryRepository.getCategoryById({ id: categoryId as CategoryId });
    const domainCategory = category ? (Object.assign(new Category(), category) as ICategory) : null;
    cache.set(categoryId, domainCategory);
    return domainCategory;
  }

  private async getPromotion(
    promotionId: PromotionId,
    cache: Map<string, IPromotion>,
  ): Promise<IPromotion | undefined> {
    const key = String(promotionId);
    if (cache.has(key)) {
      return cache.get(key);
    }

    const promotion = await this.promotionRepository.getPromotionById({ id: promotionId });
    if (promotion) {
      cache.set(key, promotion);
    }

    return promotion ?? undefined;
  }

  private async getPromotionRules(
    promotionId: PromotionId,
    cache: Map<string, IPromotionRule[]>,
  ): Promise<IPromotionRule[]> {
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

  private async getPromotionApplicableCategories(
    categoryId: string,
    cache: Map<string, IPromotionApplicableCategory[]>,
  ): Promise<IPromotionApplicableCategory[]> {
    if (cache.has(categoryId)) {
      return cache.get(categoryId) ?? [];
    }

    const associations = await this.promotionApplicableCategoryRepository.getPromotionApplicableCategoriesByCategoryId({
      categoryId: categoryId as PromotionApplicableCategoryId,
    });

    cache.set(categoryId, associations ?? []);
    return associations ?? [];
  }

  private toPromotionApplicableProduct(association: IPromotionApplicableProduct): PromotionApplicableProduct {
    return Object.assign(new PromotionApplicableProduct(), association);
  }

  private toPromotionApplicableCategory(association: IPromotionApplicableCategory): PromotionApplicableCategory {
    return Object.assign(new PromotionApplicableCategory(), association);
  }

  private toProductCategory(productCategory: IProductCategory): ProductCategory {
    return Object.assign(new ProductCategory(), productCategory);
  }
}
