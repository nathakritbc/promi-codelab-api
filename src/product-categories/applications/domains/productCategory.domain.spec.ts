import { Builder } from 'builder-pattern';
import type { Status } from 'src/types/utility.type';
import { EStatus } from 'src/types/utility.type';
import { describe, expect, it } from 'vitest';
import { ProductCategory, type CategoryId, type ProductCategoryId, type ProductId } from './productCategory.domain';

describe('ProductCategoryDomain', () => {
  const createTestProductCategory = (overrides: Partial<ProductCategory> = {}): ProductCategory => {
    const baseProductCategory = Builder<ProductCategory>()
      .uuid('test-uuid' as ProductCategoryId)
      .productId('product-uuid' as ProductId)
      .categoryId('category-uuid' as CategoryId)
      .status(EStatus.ACTIVE as unknown as Status)
      .build();

    return Object.assign(new ProductCategory(), baseProductCategory, overrides);
  };

  describe('isActive', () => {
    it('should return true when product category status is active', () => {
      // Arrange
      const productCategory = createTestProductCategory({ status: EStatus.ACTIVE as unknown as Status });

      // Act
      const result = productCategory.isActive();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when product category status is inactive', () => {
      // Arrange
      const productCategory = createTestProductCategory({ status: EStatus.INACTIVE as unknown as Status });

      // Act
      const result = productCategory.isActive();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isInactive', () => {
    it('should return true when product category status is inactive', () => {
      // Arrange
      const productCategory = createTestProductCategory({ status: EStatus.INACTIVE as unknown as Status });

      // Act
      const result = productCategory.isInactive();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when product category status is active', () => {
      // Arrange
      const productCategory = createTestProductCategory({ status: EStatus.ACTIVE as unknown as Status });

      // Act
      const result = productCategory.isInactive();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('canBeDeleted', () => {
    it('should return true when product category is not deleted', () => {
      // Arrange
      const productCategory = createTestProductCategory({ status: EStatus.ACTIVE as unknown as Status });

      // Act
      const result = productCategory.canBeDeleted();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when product category is deleted', () => {
      // Arrange
      const productCategory = createTestProductCategory({ status: EStatus.DELETED as unknown as Status });

      // Act
      const result = productCategory.canBeDeleted();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('canBeActivated', () => {
    it('should return true when product category is inactive', () => {
      // Arrange
      const productCategory = createTestProductCategory({ status: EStatus.INACTIVE as unknown as Status });

      // Act
      const result = productCategory.canBeActivated();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when product category is active', () => {
      // Arrange
      const productCategory = createTestProductCategory({ status: EStatus.ACTIVE as unknown as Status });

      // Act
      const result = productCategory.canBeActivated();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('canBeDeactivated', () => {
    it('should return true when product category is active', () => {
      // Arrange
      const productCategory = createTestProductCategory({ status: EStatus.ACTIVE as unknown as Status });

      // Act
      const result = productCategory.canBeDeactivated();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when product category is inactive', () => {
      // Arrange
      const productCategory = createTestProductCategory({ status: EStatus.INACTIVE as unknown as Status });

      // Act
      const result = productCategory.canBeDeactivated();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isSameProduct', () => {
    it('should return true when product IDs match', () => {
      // Arrange
      const productCategory = createTestProductCategory({ productId: 'product-123' as ProductId });
      const targetProductId = 'product-123' as ProductId;

      // Act
      const result = productCategory.isSameProduct(targetProductId);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when product IDs do not match', () => {
      // Arrange
      const productCategory = createTestProductCategory({ productId: 'product-123' as ProductId });
      const targetProductId = 'product-456' as ProductId;

      // Act
      const result = productCategory.isSameProduct(targetProductId);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isSameCategory', () => {
    it('should return true when category IDs match', () => {
      // Arrange
      const productCategory = createTestProductCategory({ categoryId: 'category-123' as CategoryId });
      const targetCategoryId = 'category-123' as CategoryId;

      // Act
      const result = productCategory.isSameCategory(targetCategoryId);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when category IDs do not match', () => {
      // Arrange
      const productCategory = createTestProductCategory({ categoryId: 'category-123' as CategoryId });
      const targetCategoryId = 'category-456' as CategoryId;

      // Act
      const result = productCategory.isSameCategory(targetCategoryId);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isSameAssociation', () => {
    it('should return true when both product and category IDs match', () => {
      // Arrange
      const productCategory = createTestProductCategory({
        productId: 'product-123' as ProductId,
        categoryId: 'category-123' as CategoryId,
      });
      const targetProductId = 'product-123' as ProductId;
      const targetCategoryId = 'category-123' as CategoryId;

      // Act
      const result = productCategory.isSameAssociation(targetProductId, targetCategoryId);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when product ID does not match', () => {
      // Arrange
      const productCategory = createTestProductCategory({
        productId: 'product-123' as ProductId,
        categoryId: 'category-123' as CategoryId,
      });
      const targetProductId = 'product-456' as ProductId;
      const targetCategoryId = 'category-123' as CategoryId;

      // Act
      const result = productCategory.isSameAssociation(targetProductId, targetCategoryId);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when category ID does not match', () => {
      // Arrange
      const productCategory = createTestProductCategory({
        productId: 'product-123' as ProductId,
        categoryId: 'category-123' as CategoryId,
      });
      const targetProductId = 'product-123' as ProductId;
      const targetCategoryId = 'category-456' as CategoryId;

      // Act
      const result = productCategory.isSameAssociation(targetProductId, targetCategoryId);

      // Assert
      expect(result).toBe(false);
    });
  });
});
