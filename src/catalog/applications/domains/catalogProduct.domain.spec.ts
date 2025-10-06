import { Builder } from 'builder-pattern';
import {
  type IProduct,
  Product,
  type ProductCode,
  type ProductDescription,
  type ProductId,
  type ProductName,
  type ProductPrice,
} from 'src/products/applications/domains/product.domain';
import {
  EPromotionRuleScope,
  type IPromotionRule,
  type PromotionRuleId,
  type PromotionRuleMinAmount,
  type PromotionRuleScope,
} from 'src/promotion-rules/applications/domains/promotionRule.domain';
import {
  type DiscountType,
  EDiscountType,
  EPromotionStatus,
  type IPromotion,
  Promotion,
  type PromotionDiscountValue,
  type PromotionEndsAt,
  type PromotionId,
  type PromotionName,
  type PromotionPriority,
  type PromotionStartsAt,
  type PromotionStatus,
} from 'src/promotions/applications/domains/promotion.domain';
import { EStatus, Status } from 'src/types/utility.type';
import { describe, expect, it } from 'vitest';
import { CatalogProduct, EPromotionOfferSource } from './catalogProduct.domain';

const createTestProduct = (overrides: Partial<IProduct> = {}): Product => {
  const base = Builder<IProduct>()
    .uuid('product-1' as ProductId)
    .code('P001' as ProductCode)
    .name('Test Product' as ProductName)
    .description('Test description' as ProductDescription)
    .price(1000 as ProductPrice)
    .status(EStatus.ACTIVE as Status)
    .build();

  return Object.assign(new Product(), base, overrides);
};

const createPromotion = (overrides: Partial<IPromotion> = {}): IPromotion => {
  const now = new Date();
  const basePromotion = Builder<IPromotion>()
    .uuid('promotion-1' as PromotionId)
    .name('Promo 1' as PromotionName)
    .status(EPromotionStatus.ACTIVE as PromotionStatus)
    .startsAt(new Date(now.getTime() - 60_000) as PromotionStartsAt)
    .endsAt(new Date(now.getTime() + 60_000) as PromotionEndsAt)
    .discountType(EDiscountType.PERCENT as DiscountType)
    .discountValue(10 as PromotionDiscountValue)
    .priority(1 as PromotionPriority)
    .build();

  return Object.assign(new Promotion(), basePromotion, overrides);
};

describe('CatalogProduct domain', () => {
  it('should evaluate active promotion and calculate discount correctly', () => {
    const product = createTestProduct();
    const promotion = createPromotion({
      discountValue: 20 as PromotionDiscountValue,
    });

    const catalogProduct = new CatalogProduct(product);

    catalogProduct.evaluatePromotion({
      promotion,
      source: EPromotionOfferSource.PRODUCT,
    });

    const snapshot = catalogProduct.toSnapshot();
    expect(snapshot.appliedPromotion).toBeDefined();
    expect(snapshot.appliedPromotion?.discountAmount).toBeCloseTo(200);
    expect(snapshot.finalPrice).toBeCloseTo(800);
  });

  it('should ignore inactive promotions', () => {
    const product = createTestProduct();
    const promotion = createPromotion({
      status: EPromotionStatus.PAUSED as PromotionStatus,
    });

    const catalogProduct = new CatalogProduct(product);

    catalogProduct.evaluatePromotion({
      promotion,
      source: EPromotionOfferSource.PRODUCT,
    });

    const snapshot = catalogProduct.toSnapshot();
    expect(snapshot.appliedPromotion).toBeUndefined();
    expect(snapshot.finalPrice).toBe(1000);
  });

  it('should not apply promotion when discount amount is less than or equal to 0', () => {
    // Arrange
    const product = createTestProduct();
    const promotion = createPromotion({
      discountValue: 0 as PromotionDiscountValue,
    });

    const catalogProduct = new CatalogProduct(product);

    // Act
    catalogProduct.evaluatePromotion({
      promotion,
      source: EPromotionOfferSource.PRODUCT,
    });

    // Assert
    const snapshot = catalogProduct.toSnapshot();
    expect(snapshot.appliedPromotion).toBeUndefined();
    expect(snapshot.finalPrice).toBe(1000);
    expect(snapshot.discountAmount).toBe(0);
  });

  it('should respect promotion rules', () => {
    const product = createTestProduct();
    const promotion = createPromotion();

    const catalogProduct = new CatalogProduct(product);

    const failingRule = Builder<IPromotionRule>()
      .uuid('rule-2' as PromotionRuleId)
      .promotionId(promotion.uuid)
      .scope(EPromotionRuleScope.PRODUCT as PromotionRuleScope)
      .minAmount(2000 as PromotionRuleMinAmount)
      .build();

    catalogProduct.evaluatePromotion({
      promotion,
      rules: [failingRule],
      source: EPromotionOfferSource.PRODUCT,
    });

    expect(catalogProduct.getBestPromotion()).toBeUndefined();
  });

  it('should pick promotion with highest discount amount', () => {
    const product = createTestProduct();
    const fixedPromotion = createPromotion({
      uuid: 'promotion-fixed' as PromotionId,
      discountType: EDiscountType.FIXED as DiscountType,
      discountValue: 150 as PromotionDiscountValue,
      priority: 1 as PromotionPriority,
    });

    const percentPromotion = createPromotion({
      uuid: 'promotion-percent' as PromotionId,
      discountType: EDiscountType.PERCENT as DiscountType,
      discountValue: 25 as PromotionDiscountValue,
      priority: 0 as PromotionPriority,
    });

    const catalogProduct = new CatalogProduct(product);

    catalogProduct.evaluatePromotion({
      promotion: fixedPromotion,
      source: EPromotionOfferSource.PRODUCT,
    });

    catalogProduct.evaluatePromotion({
      promotion: percentPromotion,
      source: EPromotionOfferSource.CATEGORY,
    });

    const bestPromotion = catalogProduct.getBestPromotion();
    expect(bestPromotion?.promotionId).toBe('promotion-percent');
    expect(bestPromotion?.discountAmount).toBeCloseTo(250);
  });

  it('should replace existing offer for same promotion when discount is better', () => {
    const product = createTestProduct();
    const promotion = createPromotion({
      uuid: 'promotion-duplicate' as PromotionId,
    });

    const catalogProduct = new CatalogProduct(product);

    catalogProduct.evaluatePromotion({
      promotion,
      source: EPromotionOfferSource.PRODUCT,
      metadata: { associationId: 'assoc-1' },
    });

    // Evaluate again with higher amount override to simulate better discount
    catalogProduct.evaluatePromotion({
      promotion,
      amountOverride: 1200,
      source: EPromotionOfferSource.CATEGORY,
      metadata: { associationId: 'assoc-2' },
    });

    const promotions = catalogProduct.getApplicablePromotions();
    expect(promotions).toHaveLength(1);
    const [offer] = promotions;
    expect(offer.metadata?.associationId).toBe('assoc-2');
    expect(offer.discountAmount).toBeCloseTo(120);
    expect(offer.source).toBe(EPromotionOfferSource.CATEGORY);
  });
});
