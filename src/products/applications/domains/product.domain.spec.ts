import { Builder } from 'builder-pattern';
import type { Status } from 'src/types/utility.type';
import { EStatus } from 'src/types/utility.type';
import { describe, expect, it } from 'vitest';
import {
  Product,
  type ProductCode,
  type ProductDescription,
  type ProductId,
  type ProductName,
  type ProductPrice,
} from './product.domain';

describe('ProductDomain', () => {
  const createTestProduct = (overrides: Partial<Product> = {}): Product => {
    const baseProduct = Builder<Product>()
      .uuid('test-uuid' as ProductId)
      .code('PROD-001' as ProductCode)
      .name('Test Product' as ProductName)
      .description('Test Description' as ProductDescription)
      .price(100 as ProductPrice)
      .status(EStatus.ACTIVE as unknown as Status)
      .build();

    return Object.assign(new Product(), baseProduct, overrides);
  };

  describe('isActive', () => {
    it('should return true when product status is active', () => {
      // Arrange
      const product = createTestProduct({ status: EStatus.ACTIVE as unknown as Status });

      // Act
      const result = product.isActive();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when product status is inactive', () => {
      // Arrange
      const product = createTestProduct({ status: EStatus.INACTIVE as unknown as Status });

      // Act
      const result = product.isActive();

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when product status is deleted', () => {
      // Arrange
      const product = createTestProduct({ status: EStatus.DELETED as unknown as Status });

      // Act
      const result = product.isActive();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isAvailable', () => {
    it('should return true when product is active and has price greater than 0', () => {
      // Arrange
      const product = createTestProduct({
        status: EStatus.ACTIVE as unknown as Status,
        price: 100 as ProductPrice,
      });

      // Act
      const result = product.isAvailable();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when product is inactive', () => {
      // Arrange
      const product = createTestProduct({
        status: EStatus.INACTIVE as unknown as Status,
        price: 100 as ProductPrice,
      });

      // Act
      const result = product.isAvailable();

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when product price is 0', () => {
      // Arrange
      const product = createTestProduct({
        status: EStatus.ACTIVE as unknown as Status,
        price: 0 as ProductPrice,
      });

      // Act
      const result = product.isAvailable();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('canBeDeleted', () => {
    it('should return true when product status is active', () => {
      // Arrange
      const product = createTestProduct({ status: EStatus.ACTIVE as unknown as Status });

      // Act
      const result = product.canBeDeleted();

      // Assert
      expect(result).toBe(true);
    });

    it('should return true when product status is inactive', () => {
      // Arrange
      const product = createTestProduct({ status: EStatus.INACTIVE as unknown as Status });

      // Act
      const result = product.canBeDeleted();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when product status is deleted', () => {
      // Arrange
      const product = createTestProduct({ status: EStatus.DELETED as unknown as Status });

      // Act
      const result = product.canBeDeleted();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('calculateDiscountedPrice', () => {
    it('should calculate discounted price correctly for active product', () => {
      // Arrange
      const product = createTestProduct({
        status: EStatus.ACTIVE as unknown as Status,
        price: 1000 as ProductPrice,
      });

      // Act
      const result = product.calculateDiscountedPrice(20);

      // Assert
      expect(result).toBe(800);
    });

    it('should return original price when product is not active', () => {
      // Arrange
      const product = createTestProduct({
        status: EStatus.INACTIVE as unknown as Status,
        price: 1000 as ProductPrice,
      });

      // Act
      const result = product.calculateDiscountedPrice(20);

      // Assert
      expect(result).toBe(1000);
    });

    it('should calculate 50% discount correctly', () => {
      // Arrange
      const product = createTestProduct({
        status: EStatus.ACTIVE as unknown as Status,
        price: 100 as ProductPrice,
      });

      // Act
      const result = product.calculateDiscountedPrice(50);

      // Assert
      expect(result).toBe(50);
    });

    it('should handle 0% discount', () => {
      // Arrange
      const product = createTestProduct({
        status: EStatus.ACTIVE as unknown as Status,
        price: 100 as ProductPrice,
      });

      // Act
      const result = product.calculateDiscountedPrice(0);

      // Assert
      expect(result).toBe(100);
    });

    it('should handle 100% discount', () => {
      // Arrange
      const product = createTestProduct({
        status: EStatus.ACTIVE as unknown as Status,
        price: 100 as ProductPrice,
      });

      // Act
      const result = product.calculateDiscountedPrice(100);

      // Assert
      expect(result).toBe(0);
    });
  });
});
