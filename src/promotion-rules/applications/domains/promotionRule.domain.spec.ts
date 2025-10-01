import { Builder } from 'builder-pattern';
import type { PromotionId } from 'src/promotions/applications/domains/promotion.domain';
import { describe, expect, it } from 'vitest';
import {
  EPromotionRuleScope,
  PromotionRule,
  type PromotionRuleId,
  type PromotionRuleMinAmount,
  type PromotionRuleMinQty,
  type PromotionRuleScope,
} from './promotionRule.domain';

describe('PromotionRuleDomain', () => {
  const createTestPromotionRule = (overrides: Partial<PromotionRule> = {}): PromotionRule => {
    const baseRule = Builder<PromotionRule>()
      .uuid('test-rule-uuid' as PromotionRuleId)
      .promotionId('test-promotion-uuid' as PromotionId)
      .scope(EPromotionRuleScope.PRODUCT as unknown as PromotionRuleScope)
      .minQty(5 as PromotionRuleMinQty)
      .minAmount(1000 as PromotionRuleMinAmount)
      .build();

    return Object.assign(new PromotionRule(), baseRule, overrides);
  };

  describe('hasMinimumQuantityRequirement', () => {
    it('should return true when minQty is set and greater than 0', () => {
      // Arrange
      const rule = createTestPromotionRule({ minQty: 5 as PromotionRuleMinQty });

      // Act
      const result = rule.hasMinimumQuantityRequirement();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when minQty is not set', () => {
      // Arrange
      const rule = createTestPromotionRule({ minQty: undefined });

      // Act
      const result = rule.hasMinimumQuantityRequirement();

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when minQty is 0', () => {
      // Arrange
      const rule = createTestPromotionRule({ minQty: 0 as PromotionRuleMinQty });

      // Act
      const result = rule.hasMinimumQuantityRequirement();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('hasMinimumAmountRequirement', () => {
    it('should return true when minAmount is set and greater than 0', () => {
      // Arrange
      const rule = createTestPromotionRule({ minAmount: 1000 as PromotionRuleMinAmount });

      // Act
      const result = rule.hasMinimumAmountRequirement();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when minAmount is not set', () => {
      // Arrange
      const rule = createTestPromotionRule({ minAmount: undefined });

      // Act
      const result = rule.hasMinimumAmountRequirement();

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when minAmount is 0', () => {
      // Arrange
      const rule = createTestPromotionRule({ minAmount: 0 as PromotionRuleMinAmount });

      // Act
      const result = rule.hasMinimumAmountRequirement();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('meetsQuantityRequirement', () => {
    it('should return true when quantity meets minimum requirement', () => {
      // Arrange
      const rule = createTestPromotionRule({ minQty: 5 as PromotionRuleMinQty });

      // Act
      const result = rule.meetsQuantityRequirement(10);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true when quantity equals minimum requirement', () => {
      // Arrange
      const rule = createTestPromotionRule({ minQty: 5 as PromotionRuleMinQty });

      // Act
      const result = rule.meetsQuantityRequirement(5);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when quantity is below minimum requirement', () => {
      // Arrange
      const rule = createTestPromotionRule({ minQty: 5 as PromotionRuleMinQty });

      // Act
      const result = rule.meetsQuantityRequirement(3);

      // Assert
      expect(result).toBe(false);
    });

    it('should return true when no minimum quantity requirement is set', () => {
      // Arrange
      const rule = createTestPromotionRule({ minQty: undefined });

      // Act
      const result = rule.meetsQuantityRequirement(1);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('meetsAmountRequirement', () => {
    it('should return true when amount meets minimum requirement', () => {
      // Arrange
      const rule = createTestPromotionRule({ minAmount: 1000 as PromotionRuleMinAmount });

      // Act
      const result = rule.meetsAmountRequirement(1500);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true when amount equals minimum requirement', () => {
      // Arrange
      const rule = createTestPromotionRule({ minAmount: 1000 as PromotionRuleMinAmount });

      // Act
      const result = rule.meetsAmountRequirement(1000);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when amount is below minimum requirement', () => {
      // Arrange
      const rule = createTestPromotionRule({ minAmount: 1000 as PromotionRuleMinAmount });

      // Act
      const result = rule.meetsAmountRequirement(500);

      // Assert
      expect(result).toBe(false);
    });

    it('should return true when no minimum amount requirement is set', () => {
      // Arrange
      const rule = createTestPromotionRule({ minAmount: undefined });

      // Act
      const result = rule.meetsAmountRequirement(100);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('isApplicable', () => {
    it('should return true when both quantity and amount requirements are met', () => {
      // Arrange
      const rule = createTestPromotionRule({
        minQty: 5 as PromotionRuleMinQty,
        minAmount: 1000 as PromotionRuleMinAmount,
      });

      // Act
      const result = rule.isApplicable(10, 1500);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when quantity requirement is not met', () => {
      // Arrange
      const rule = createTestPromotionRule({
        minQty: 5 as PromotionRuleMinQty,
        minAmount: 1000 as PromotionRuleMinAmount,
      });

      // Act
      const result = rule.isApplicable(3, 1500);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when amount requirement is not met', () => {
      // Arrange
      const rule = createTestPromotionRule({
        minQty: 5 as PromotionRuleMinQty,
        minAmount: 1000 as PromotionRuleMinAmount,
      });

      // Act
      const result = rule.isApplicable(10, 500);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when both requirements are not met', () => {
      // Arrange
      const rule = createTestPromotionRule({
        minQty: 5 as PromotionRuleMinQty,
        minAmount: 1000 as PromotionRuleMinAmount,
      });

      // Act
      const result = rule.isApplicable(3, 500);

      // Assert
      expect(result).toBe(false);
    });

    it('should return true when no requirements are set', () => {
      // Arrange
      const rule = createTestPromotionRule({
        minQty: undefined,
        minAmount: undefined,
      });

      // Act
      const result = rule.isApplicable(1, 1);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true when only quantity requirement is set and met', () => {
      // Arrange
      const rule = createTestPromotionRule({
        minQty: 5 as PromotionRuleMinQty,
        minAmount: undefined,
      });

      // Act
      const result = rule.isApplicable(10, 100);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true when only amount requirement is set and met', () => {
      // Arrange
      const rule = createTestPromotionRule({
        minQty: undefined,
        minAmount: 1000 as PromotionRuleMinAmount,
      });

      // Act
      const result = rule.isApplicable(1, 1500);

      // Assert
      expect(result).toBe(true);
    });
  });
});
