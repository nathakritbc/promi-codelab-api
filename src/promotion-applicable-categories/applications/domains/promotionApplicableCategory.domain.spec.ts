import { Builder } from 'builder-pattern';
import type { Status } from 'src/types/utility.type';
import { EStatus } from 'src/types/utility.type';
import { describe, expect, it } from 'vitest';
import {
  PromotionApplicableCategory,
  type CategoryId,
  type IncludeChildren,
  type PromotionApplicableCategoryId,
  type PromotionId,
} from './promotionApplicableCategory.domain';

describe('PromotionApplicableCategoryDomain', () => {
  const createTestPromotionApplicableCategory = (
    overrides: Partial<PromotionApplicableCategory> = {},
  ): PromotionApplicableCategory => {
    const basePromotionApplicableCategory = Builder<PromotionApplicableCategory>()
      .uuid('test-uuid' as PromotionApplicableCategoryId)
      .promotionId('promotion-uuid' as PromotionId)
      .categoryId('category-uuid' as CategoryId)
      .includeChildren(true as IncludeChildren)
      .status(EStatus.ACTIVE as unknown as Status)
      .build();

    return Object.assign(new PromotionApplicableCategory(), basePromotionApplicableCategory, overrides);
  };

  describe('isActive', () => {
    it('should return true when promotion applicable category status is active', () => {
      // Arrange
      const promotionApplicableCategory = createTestPromotionApplicableCategory({
        status: EStatus.ACTIVE as unknown as Status,
      });

      // Act
      const result = promotionApplicableCategory.isActive();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when promotion applicable category status is inactive', () => {
      // Arrange
      const promotionApplicableCategory = createTestPromotionApplicableCategory({
        status: EStatus.INACTIVE as unknown as Status,
      });

      // Act
      const result = promotionApplicableCategory.isActive();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('shouldIncludeChildren', () => {
    it('should return true when includeChildren is true', () => {
      // Arrange
      const promotionApplicableCategory = createTestPromotionApplicableCategory({
        includeChildren: true as IncludeChildren,
      });

      // Act
      const result = promotionApplicableCategory.shouldIncludeChildren();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when includeChildren is false', () => {
      // Arrange
      const promotionApplicableCategory = createTestPromotionApplicableCategory({
        includeChildren: false as IncludeChildren,
      });

      // Act
      const result = promotionApplicableCategory.shouldIncludeChildren();

      // Assert
      expect(result).toBe(false);
    });
  });
});
