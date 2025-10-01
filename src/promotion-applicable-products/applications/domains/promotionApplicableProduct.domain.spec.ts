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

  describe('isInactive', () => {
    it('should return true when promotion applicable product status is inactive', () => {
      // Arrange
      const promotionApplicableProduct = createTestPromotionApplicableProduct({
        status: EStatus.INACTIVE as unknown as Status,
      });

      // Act
      const result = promotionApplicableProduct.isInactive();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when promotion applicable product status is active', () => {
      // Arrange
      const promotionApplicableProduct = createTestPromotionApplicableProduct({
        status: EStatus.ACTIVE as unknown as Status,
      });

      // Act
      const result = promotionApplicableProduct.isInactive();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('canBeDeleted', () => {
    it('should return true when promotion applicable product is not deleted', () => {
      // Arrange
      const promotionApplicableProduct = createTestPromotionApplicableProduct({
        status: EStatus.ACTIVE as unknown as Status,
      });

      // Act
      const result = promotionApplicableProduct.canBeDeleted();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when promotion applicable product is deleted', () => {
      // Arrange
      const promotionApplicableProduct = createTestPromotionApplicableProduct({
        status: EStatus.DELETED as unknown as Status,
      });

      // Act
      const result = promotionApplicableProduct.canBeDeleted();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('canBeActivated', () => {
    it('should return true when promotion applicable product is inactive', () => {
      // Arrange
      const promotionApplicableProduct = createTestPromotionApplicableProduct({
        status: EStatus.INACTIVE as unknown as Status,
      });

      // Act
      const result = promotionApplicableProduct.canBeActivated();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when promotion applicable product is active', () => {
      // Arrange
      const promotionApplicableProduct = createTestPromotionApplicableProduct({
        status: EStatus.ACTIVE as unknown as Status,
      });

      // Act
      const result = promotionApplicableProduct.canBeActivated();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('canBeDeactivated', () => {
    it('should return true when promotion applicable product is active', () => {
      // Arrange
      const promotionApplicableProduct = createTestPromotionApplicableProduct({
        status: EStatus.ACTIVE as unknown as Status,
      });

      // Act
      const result = promotionApplicableProduct.canBeDeactivated();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when promotion applicable product is inactive', () => {
      // Arrange
      const promotionApplicableProduct = createTestPromotionApplicableProduct({
        status: EStatus.INACTIVE as unknown as Status,
      });

      // Act
      const result = promotionApplicableProduct.canBeDeactivated();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isSamePromotion', () => {
    it('should return true when promotion IDs match', () => {
      // Arrange
      const promotionApplicableProduct = createTestPromotionApplicableProduct({
        promotionId: 'promotion-123' as PromotionId,
      });
      const targetPromotionId = 'promotion-123' as PromotionId;

      // Act
      const result = promotionApplicableProduct.isSamePromotion(targetPromotionId);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when promotion IDs do not match', () => {
      // Arrange
      const promotionApplicableProduct = createTestPromotionApplicableProduct({
        promotionId: 'promotion-123' as PromotionId,
      });
      const targetPromotionId = 'promotion-456' as PromotionId;

      // Act
      const result = promotionApplicableProduct.isSamePromotion(targetPromotionId);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isSameProduct', () => {
    it('should return true when product IDs match', () => {
      // Arrange
      const promotionApplicableProduct = createTestPromotionApplicableProduct({
        productId: 'product-123' as ProductId,
      });
      const targetProductId = 'product-123' as ProductId;

      // Act
      const result = promotionApplicableProduct.isSameProduct(targetProductId);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when product IDs do not match', () => {
      // Arrange
      const promotionApplicableProduct = createTestPromotionApplicableProduct({
        productId: 'product-123' as ProductId,
      });
      const targetProductId = 'product-456' as ProductId;

      // Act
      const result = promotionApplicableProduct.isSameProduct(targetProductId);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isSameAssociation', () => {
    it('should return true when both promotion and product IDs match', () => {
      // Arrange
      const promotionApplicableProduct = createTestPromotionApplicableProduct({
        promotionId: 'promotion-123' as PromotionId,
        productId: 'product-123' as ProductId,
      });
      const targetPromotionId = 'promotion-123' as PromotionId;
      const targetProductId = 'product-123' as ProductId;

      // Act
      const result = promotionApplicableProduct.isSameAssociation(targetPromotionId, targetProductId);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when promotion ID does not match', () => {
      // Arrange
      const promotionApplicableProduct = createTestPromotionApplicableProduct({
        promotionId: 'promotion-123' as PromotionId,
        productId: 'product-123' as ProductId,
      });
      const targetPromotionId = 'promotion-456' as PromotionId;
      const targetProductId = 'product-123' as ProductId;

      // Act
      const result = promotionApplicableProduct.isSameAssociation(targetPromotionId, targetProductId);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when product ID does not match', () => {
      // Arrange
      const promotionApplicableProduct = createTestPromotionApplicableProduct({
        promotionId: 'promotion-123' as PromotionId,
        productId: 'product-123' as ProductId,
      });
      const targetPromotionId = 'promotion-123' as PromotionId;
      const targetProductId = 'product-456' as ProductId;

      // Act
      const result = promotionApplicableProduct.isSameAssociation(targetPromotionId, targetProductId);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isApplicableToProduct', () => {
    it('should return true when active and same product', () => {
      // Arrange
      const promotionApplicableProduct = createTestPromotionApplicableProduct({
        status: EStatus.ACTIVE as unknown as Status,
        productId: 'product-123' as ProductId,
      });
      const targetProductId = 'product-123' as ProductId;

      // Act
      const result = promotionApplicableProduct.isApplicableToProduct(targetProductId);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when inactive', () => {
      // Arrange
      const promotionApplicableProduct = createTestPromotionApplicableProduct({
        status: EStatus.INACTIVE as unknown as Status,
        productId: 'product-123' as ProductId,
      });
      const targetProductId = 'product-123' as ProductId;

      // Act
      const result = promotionApplicableProduct.isApplicableToProduct(targetProductId);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when different product', () => {
      // Arrange
      const promotionApplicableProduct = createTestPromotionApplicableProduct({
        status: EStatus.ACTIVE as unknown as Status,
        productId: 'product-123' as ProductId,
      });
      const targetProductId = 'product-456' as ProductId;

      // Act
      const result = promotionApplicableProduct.isApplicableToProduct(targetProductId);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isApplicableToPromotion', () => {
    it('should return true when active and same promotion', () => {
      // Arrange
      const promotionApplicableProduct = createTestPromotionApplicableProduct({
        status: EStatus.ACTIVE as unknown as Status,
        promotionId: 'promotion-123' as PromotionId,
      });
      const targetPromotionId = 'promotion-123' as PromotionId;

      // Act
      const result = promotionApplicableProduct.isApplicableToPromotion(targetPromotionId);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when inactive', () => {
      // Arrange
      const promotionApplicableProduct = createTestPromotionApplicableProduct({
        status: EStatus.INACTIVE as unknown as Status,
        promotionId: 'promotion-123' as PromotionId,
      });
      const targetPromotionId = 'promotion-123' as PromotionId;

      // Act
      const result = promotionApplicableProduct.isApplicableToPromotion(targetPromotionId);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when different promotion', () => {
      // Arrange
      const promotionApplicableProduct = createTestPromotionApplicableProduct({
        status: EStatus.ACTIVE as unknown as Status,
        promotionId: 'promotion-123' as PromotionId,
      });
      const targetPromotionId = 'promotion-456' as PromotionId;

      // Act
      const result = promotionApplicableProduct.isApplicableToPromotion(targetPromotionId);

      // Assert
      expect(result).toBe(false);
    });
  });
});
