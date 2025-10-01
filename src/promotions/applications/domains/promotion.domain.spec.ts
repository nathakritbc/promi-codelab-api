import { Builder } from 'builder-pattern';
import { describe, expect, it } from 'vitest';
import {
  EDiscountType,
  EPromotionStatus,
  Promotion,
  type DiscountType,
  type PromotionDiscountValue,
  type PromotionEndsAt,
  type PromotionId,
  type PromotionMaxDiscountAmount,
  type PromotionName,
  type PromotionPriority,
  type PromotionStartsAt,
  type PromotionStatus,
} from './promotion.domain';

describe('PromotionDomain', () => {
  const createTestPromotion = (overrides: Partial<Promotion> = {}): Promotion => {
    const basePromotion = Builder<Promotion>()
      .uuid('test-uuid' as PromotionId)
      .name('Test Promotion' as PromotionName)
      .status(EPromotionStatus.ACTIVE as unknown as PromotionStatus)
      .startsAt(new Date('2025-01-01') as PromotionStartsAt)
      .endsAt(new Date('2025-12-31') as PromotionEndsAt)
      .discountType(EDiscountType.PERCENT as unknown as DiscountType)
      .discountValue(10 as PromotionDiscountValue)
      .maxDiscountAmount(100 as PromotionMaxDiscountAmount)
      .priority(1 as PromotionPriority)
      .build();

    return Object.assign(new Promotion(), basePromotion, overrides);
  };

  describe('isActive', () => {
    it('should return true when promotion is active and within date range', () => {
      // Arrange
      const promotion = createTestPromotion({
        status: EPromotionStatus.ACTIVE as unknown as PromotionStatus,
        startsAt: new Date(Date.now() - 86400000) as PromotionStartsAt, // 1 day ago
        endsAt: new Date(Date.now() + 86400000) as PromotionEndsAt, // 1 day ahead
      });

      // Act
      const result = promotion.isActive();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when promotion status is not active', () => {
      // Arrange
      const promotion = createTestPromotion({
        status: EPromotionStatus.DRAFT as unknown as PromotionStatus,
      });

      // Act
      const result = promotion.isActive();

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when current date is before starts_at', () => {
      // Arrange
      const promotion = createTestPromotion({
        startsAt: new Date(Date.now() + 86400000) as PromotionStartsAt, // 1 day ahead
        endsAt: new Date(Date.now() + 172800000) as PromotionEndsAt, // 2 days ahead
      });

      // Act
      const result = promotion.isActive();

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when current date is after ends_at', () => {
      // Arrange
      const promotion = createTestPromotion({
        startsAt: new Date(Date.now() - 172800000) as PromotionStartsAt, // 2 days ago
        endsAt: new Date(Date.now() - 86400000) as PromotionEndsAt, // 1 day ago
      });

      // Act
      const result = promotion.isActive();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('calculateDiscount', () => {
    it('should return 0 when promotion is not active', () => {
      // Arrange
      const promotion = createTestPromotion({
        status: EPromotionStatus.PAUSED as unknown as PromotionStatus,
      });

      // Act
      const result = promotion.calculateDiscount(1000);

      // Assert
      expect(result).toBe(0);
    });

    it('should calculate fixed discount correctly', () => {
      // Arrange
      const promotion = createTestPromotion({
        status: EPromotionStatus.ACTIVE as unknown as PromotionStatus,
        startsAt: new Date(Date.now() - 86400000) as PromotionStartsAt,
        endsAt: new Date(Date.now() + 86400000) as PromotionEndsAt,
        discountType: EDiscountType.FIXED as unknown as DiscountType,
        discountValue: 50 as PromotionDiscountValue,
      });

      // Act
      const result = promotion.calculateDiscount(1000);

      // Assert
      expect(result).toBe(50);
    });

    it('should not exceed amount when fixed discount is higher than amount', () => {
      // Arrange
      const promotion = createTestPromotion({
        status: EPromotionStatus.ACTIVE as unknown as PromotionStatus,
        startsAt: new Date(Date.now() - 86400000) as PromotionStartsAt,
        endsAt: new Date(Date.now() + 86400000) as PromotionEndsAt,
        discountType: EDiscountType.FIXED as unknown as DiscountType,
        discountValue: 200 as PromotionDiscountValue,
      });

      // Act
      const result = promotion.calculateDiscount(100);

      // Assert
      expect(result).toBe(100);
    });

    it('should calculate percent discount correctly', () => {
      // Arrange
      const promotion = createTestPromotion({
        status: EPromotionStatus.ACTIVE as unknown as PromotionStatus,
        startsAt: new Date(Date.now() - 86400000) as PromotionStartsAt,
        endsAt: new Date(Date.now() + 86400000) as PromotionEndsAt,
        discountType: EDiscountType.PERCENT as unknown as DiscountType,
        discountValue: 20 as PromotionDiscountValue,
        maxDiscountAmount: undefined,
      });

      // Act
      const result = promotion.calculateDiscount(1000);

      // Assert
      expect(result).toBe(200);
    });

    it('should apply max discount cap for percent discount', () => {
      // Arrange
      const promotion = createTestPromotion({
        status: EPromotionStatus.ACTIVE as unknown as PromotionStatus,
        startsAt: new Date(Date.now() - 86400000) as PromotionStartsAt,
        endsAt: new Date(Date.now() + 86400000) as PromotionEndsAt,
        discountType: EDiscountType.PERCENT as unknown as DiscountType,
        discountValue: 20 as PromotionDiscountValue,
        maxDiscountAmount: 100 as PromotionMaxDiscountAmount,
      });

      // Act
      const result = promotion.calculateDiscount(1000);

      // Assert
      expect(result).toBe(100);
    });

    it('should not apply max discount cap when discount is below cap', () => {
      // Arrange
      const promotion = createTestPromotion({
        status: EPromotionStatus.ACTIVE as unknown as PromotionStatus,
        startsAt: new Date(Date.now() - 86400000) as PromotionStartsAt,
        endsAt: new Date(Date.now() + 86400000) as PromotionEndsAt,
        discountType: EDiscountType.PERCENT as unknown as DiscountType,
        discountValue: 10 as PromotionDiscountValue,
        maxDiscountAmount: 200 as PromotionMaxDiscountAmount,
      });

      // Act
      const result = promotion.calculateDiscount(1000);

      // Assert
      expect(result).toBe(100);
    });
  });

  describe('canBeModified', () => {
    it('should return true when promotion is in draft status', () => {
      // Arrange
      const promotion = createTestPromotion({
        status: EPromotionStatus.DRAFT as unknown as PromotionStatus,
      });

      // Act
      const result = promotion.canBeModified();

      // Assert
      expect(result).toBe(true);
    });

    it('should return true when promotion is in active status', () => {
      // Arrange
      const promotion = createTestPromotion({
        status: EPromotionStatus.ACTIVE as unknown as PromotionStatus,
      });

      // Act
      const result = promotion.canBeModified();

      // Assert
      expect(result).toBe(true);
    });

    it('should return true when promotion is in paused status', () => {
      // Arrange
      const promotion = createTestPromotion({
        status: EPromotionStatus.PAUSED as unknown as PromotionStatus,
      });

      // Act
      const result = promotion.canBeModified();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when promotion is in ended status', () => {
      // Arrange
      const promotion = createTestPromotion({
        status: EPromotionStatus.ENDED as unknown as PromotionStatus,
      });

      // Act
      const result = promotion.canBeModified();

      // Assert
      expect(result).toBe(false);
    });
  });
});
