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

  describe('isInactive', () => {
    it('should return true when promotion applicable category status is inactive', () => {
      // Arrange
      const promotionApplicableCategory = createTestPromotionApplicableCategory({
        status: EStatus.INACTIVE as unknown as Status,
      });

      // Act
      const result = promotionApplicableCategory.isInactive();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when promotion applicable category status is active', () => {
      // Arrange
      const promotionApplicableCategory = createTestPromotionApplicableCategory({
        status: EStatus.ACTIVE as unknown as Status,
      });

      // Act
      const result = promotionApplicableCategory.isInactive();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('canBeDeleted', () => {
    it('should return true when promotion applicable category is not deleted', () => {
      // Arrange
      const promotionApplicableCategory = createTestPromotionApplicableCategory({
        status: EStatus.ACTIVE as unknown as Status,
      });

      // Act
      const result = promotionApplicableCategory.canBeDeleted();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when promotion applicable category is deleted', () => {
      // Arrange
      const promotionApplicableCategory = createTestPromotionApplicableCategory({
        status: EStatus.DELETED as unknown as Status,
      });

      // Act
      const result = promotionApplicableCategory.canBeDeleted();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('canBeActivated', () => {
    it('should return true when promotion applicable category is inactive', () => {
      // Arrange
      const promotionApplicableCategory = createTestPromotionApplicableCategory({
        status: EStatus.INACTIVE as unknown as Status,
      });

      // Act
      const result = promotionApplicableCategory.canBeActivated();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when promotion applicable category is active', () => {
      // Arrange
      const promotionApplicableCategory = createTestPromotionApplicableCategory({
        status: EStatus.ACTIVE as unknown as Status,
      });

      // Act
      const result = promotionApplicableCategory.canBeActivated();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('canBeDeactivated', () => {
    it('should return true when promotion applicable category is active', () => {
      // Arrange
      const promotionApplicableCategory = createTestPromotionApplicableCategory({
        status: EStatus.ACTIVE as unknown as Status,
      });

      // Act
      const result = promotionApplicableCategory.canBeDeactivated();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when promotion applicable category is inactive', () => {
      // Arrange
      const promotionApplicableCategory = createTestPromotionApplicableCategory({
        status: EStatus.INACTIVE as unknown as Status,
      });

      // Act
      const result = promotionApplicableCategory.canBeDeactivated();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isSamePromotion', () => {
    it('should return true when promotion IDs match', () => {
      // Arrange
      const promotionApplicableCategory = createTestPromotionApplicableCategory({
        promotionId: 'promotion-123' as PromotionId,
      });
      const targetPromotionId = 'promotion-123' as PromotionId;

      // Act
      const result = promotionApplicableCategory.isSamePromotion(targetPromotionId);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when promotion IDs do not match', () => {
      // Arrange
      const promotionApplicableCategory = createTestPromotionApplicableCategory({
        promotionId: 'promotion-123' as PromotionId,
      });
      const targetPromotionId = 'promotion-456' as PromotionId;

      // Act
      const result = promotionApplicableCategory.isSamePromotion(targetPromotionId);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isSameCategory', () => {
    it('should return true when category IDs match', () => {
      // Arrange
      const promotionApplicableCategory = createTestPromotionApplicableCategory({
        categoryId: 'category-123' as CategoryId,
      });
      const targetCategoryId = 'category-123' as CategoryId;

      // Act
      const result = promotionApplicableCategory.isSameCategory(targetCategoryId);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when category IDs do not match', () => {
      // Arrange
      const promotionApplicableCategory = createTestPromotionApplicableCategory({
        categoryId: 'category-123' as CategoryId,
      });
      const targetCategoryId = 'category-456' as CategoryId;

      // Act
      const result = promotionApplicableCategory.isSameCategory(targetCategoryId);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isSameAssociation', () => {
    it('should return true when both promotion and category IDs match', () => {
      // Arrange
      const promotionApplicableCategory = createTestPromotionApplicableCategory({
        promotionId: 'promotion-123' as PromotionId,
        categoryId: 'category-123' as CategoryId,
      });
      const targetPromotionId = 'promotion-123' as PromotionId;
      const targetCategoryId = 'category-123' as CategoryId;

      // Act
      const result = promotionApplicableCategory.isSameAssociation(targetPromotionId, targetCategoryId);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when promotion ID does not match', () => {
      // Arrange
      const promotionApplicableCategory = createTestPromotionApplicableCategory({
        promotionId: 'promotion-123' as PromotionId,
        categoryId: 'category-123' as CategoryId,
      });
      const targetPromotionId = 'promotion-456' as PromotionId;
      const targetCategoryId = 'category-123' as CategoryId;

      // Act
      const result = promotionApplicableCategory.isSameAssociation(targetPromotionId, targetCategoryId);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when category ID does not match', () => {
      // Arrange
      const promotionApplicableCategory = createTestPromotionApplicableCategory({
        promotionId: 'promotion-123' as PromotionId,
        categoryId: 'category-123' as CategoryId,
      });
      const targetPromotionId = 'promotion-123' as PromotionId;
      const targetCategoryId = 'category-456' as CategoryId;

      // Act
      const result = promotionApplicableCategory.isSameAssociation(targetPromotionId, targetCategoryId);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isApplicableToCategory', () => {
    it('should return true when active and same category', () => {
      // Arrange
      const promotionApplicableCategory = createTestPromotionApplicableCategory({
        status: EStatus.ACTIVE as unknown as Status,
        categoryId: 'category-123' as CategoryId,
      });
      const targetCategoryId = 'category-123' as CategoryId;

      // Act
      const result = promotionApplicableCategory.isApplicableToCategory(targetCategoryId);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when inactive', () => {
      // Arrange
      const promotionApplicableCategory = createTestPromotionApplicableCategory({
        status: EStatus.INACTIVE as unknown as Status,
        categoryId: 'category-123' as CategoryId,
      });
      const targetCategoryId = 'category-123' as CategoryId;

      // Act
      const result = promotionApplicableCategory.isApplicableToCategory(targetCategoryId);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when different category', () => {
      // Arrange
      const promotionApplicableCategory = createTestPromotionApplicableCategory({
        status: EStatus.ACTIVE as unknown as Status,
        categoryId: 'category-123' as CategoryId,
      });
      const targetCategoryId = 'category-456' as CategoryId;

      // Act
      const result = promotionApplicableCategory.isApplicableToCategory(targetCategoryId);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isApplicableToPromotion', () => {
    it('should return true when active and same promotion', () => {
      // Arrange
      const promotionApplicableCategory = createTestPromotionApplicableCategory({
        status: EStatus.ACTIVE as unknown as Status,
        promotionId: 'promotion-123' as PromotionId,
      });
      const targetPromotionId = 'promotion-123' as PromotionId;

      // Act
      const result = promotionApplicableCategory.isApplicableToPromotion(targetPromotionId);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when inactive', () => {
      // Arrange
      const promotionApplicableCategory = createTestPromotionApplicableCategory({
        status: EStatus.INACTIVE as unknown as Status,
        promotionId: 'promotion-123' as PromotionId,
      });
      const targetPromotionId = 'promotion-123' as PromotionId;

      // Act
      const result = promotionApplicableCategory.isApplicableToPromotion(targetPromotionId);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when different promotion', () => {
      // Arrange
      const promotionApplicableCategory = createTestPromotionApplicableCategory({
        status: EStatus.ACTIVE as unknown as Status,
        promotionId: 'promotion-123' as PromotionId,
      });
      const targetPromotionId = 'promotion-456' as PromotionId;

      // Act
      const result = promotionApplicableCategory.isApplicableToPromotion(targetPromotionId);

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

  describe('shouldExcludeChildren', () => {
    it('should return true when includeChildren is false', () => {
      // Arrange
      const promotionApplicableCategory = createTestPromotionApplicableCategory({
        includeChildren: false as IncludeChildren,
      });

      // Act
      const result = promotionApplicableCategory.shouldExcludeChildren();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when includeChildren is true', () => {
      // Arrange
      const promotionApplicableCategory = createTestPromotionApplicableCategory({
        includeChildren: true as IncludeChildren,
      });

      // Act
      const result = promotionApplicableCategory.shouldExcludeChildren();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('toggleIncludeChildren', () => {
    it('should return false when includeChildren is true', () => {
      // Arrange
      const promotionApplicableCategory = createTestPromotionApplicableCategory({
        includeChildren: true as IncludeChildren,
      });

      // Act
      const result = promotionApplicableCategory.toggleIncludeChildren();

      // Assert
      expect(result).toBe(false);
    });

    it('should return true when includeChildren is false', () => {
      // Arrange
      const promotionApplicableCategory = createTestPromotionApplicableCategory({
        includeChildren: false as IncludeChildren,
      });

      // Act
      const result = promotionApplicableCategory.toggleIncludeChildren();

      // Assert
      expect(result).toBe(true);
    });
  });
});
