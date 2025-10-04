import { Builder } from 'builder-pattern';
import type { Status } from 'src/types/utility.type';
import { EStatus } from 'src/types/utility.type';
import { describe, expect, it } from 'vitest';
import {
  PromotionApplicableProduct,
  type ProductId,
  type PromotionApplicableProductId,
  type PromotionId,
} from './promotionApplicableProduct.domain';

describe('PromotionApplicableProductDomain', () => {
  const createTestPromotionApplicableProduct = (
    overrides: Partial<PromotionApplicableProduct> = {},
  ): PromotionApplicableProduct => {
    const basePromotionApplicableProduct = Builder<PromotionApplicableProduct>()
      .uuid('test-uuid' as PromotionApplicableProductId)
      .promotionId('promotion-uuid' as PromotionId)
      .productId('product-uuid' as ProductId)
      .status(EStatus.ACTIVE as unknown as Status)
      .build();

    return Object.assign(new PromotionApplicableProduct(), basePromotionApplicableProduct, overrides);
  };

  describe('isActive', () => {
    it('should return true when promotion applicable product status is active', () => {
      // Arrange
      const promotionApplicableProduct = createTestPromotionApplicableProduct({
        status: EStatus.ACTIVE as unknown as Status,
      });

      // Act
      const result = promotionApplicableProduct.isActive();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when promotion applicable product status is inactive', () => {
      // Arrange
      const promotionApplicableProduct = createTestPromotionApplicableProduct({
        status: EStatus.INACTIVE as unknown as Status,
      });

      // Act
      const result = promotionApplicableProduct.isActive();

      // Assert
      expect(result).toBe(false);
    });
  });
});
