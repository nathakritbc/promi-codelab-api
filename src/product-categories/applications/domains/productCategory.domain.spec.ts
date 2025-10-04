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
});
