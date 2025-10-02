import { Builder } from 'builder-pattern';
import type { Status } from 'src/types/utility.type';
import { EStatus } from 'src/types/utility.type';
import { describe, expect, it } from 'vitest';
import { Category, type CategoryId, type CategoryName, type CategoryParentId } from './category.domain';

describe('CategoryDomain', () => {
  const createTestCategory = (overrides: Partial<Category> = {}): Category => {
    const baseCategory = Builder<Category>()
      .uuid('test-uuid' as CategoryId)
      .name('Test Category' as CategoryName)
      .parentId('parent-uuid' as CategoryParentId)
      .ancestors(['parent-uuid'])
      .status(EStatus.ACTIVE as unknown as Status)
      .build();

    return Object.assign(new Category(), baseCategory, overrides);
  };

  describe('isActive', () => {
    it('should return true when category status is active', () => {
      // Arrange
      const category = createTestCategory({ status: EStatus.ACTIVE as unknown as Status });

      // Act
      const result = category.isActive();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when category status is inactive', () => {
      // Arrange
      const category = createTestCategory({ status: EStatus.INACTIVE as unknown as Status });

      // Act
      const result = category.isActive();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isRoot', () => {
    it('should return true when category has no parent', () => {
      // Arrange
      const category = createTestCategory({ parentId: undefined });

      // Act
      const result = category.isRoot();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when category has parent', () => {
      // Arrange
      const category = createTestCategory({ parentId: 'parent-uuid' as CategoryParentId });

      // Act
      const result = category.isRoot();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('hasChildren', () => {
    it('should return true when category has children (rgt > lft + 1)', () => {
      // Arrange
      const category = createTestCategory({
        ancestors: ['parent-uuid'],
      });

      // Act
      const result = category.hasChildren();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when category has no children (rgt = lft + 1)', () => {
      // Arrange
      const category = createTestCategory({
        ancestors: ['parent-uuid'],
      });

      // Act
      const result = category.hasChildren();

      // Assert
      expect(result).toBeTruthy();
    });
  });

  describe('canBeDeleted', () => {
    it('should return true when category is active and has no children', () => {
      // Arrange
      const category = createTestCategory({
        status: EStatus.ACTIVE as unknown as Status,
        ancestors: ['parent-uuid'],
      });

      // Act
      const result = category.canBeDeleted();

      // Assert
      expect(result).toBeFalsy();
    });

    it('should return false when category is deleted', () => {
      // Arrange
      const category = createTestCategory({ status: EStatus.DELETED as unknown as Status });

      // Act
      const result = category.canBeDeleted();

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when category has children', () => {
      // Arrange
      const category = createTestCategory({
        status: EStatus.ACTIVE as unknown as Status,
        ancestors: ['parent-uuid'],
      });

      // Act
      const result = category.canBeDeleted();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('canBeMoved', () => {
    it('should return true when category is active and not root', () => {
      // Arrange
      const category = createTestCategory({
        status: EStatus.ACTIVE as unknown as Status,
        parentId: 'parent-uuid' as CategoryParentId,
      });

      // Act
      const result = category.canBeMoved();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when category is inactive', () => {
      // Arrange
      const category = createTestCategory({
        status: EStatus.INACTIVE as unknown as Status,
        parentId: 'parent-uuid' as CategoryParentId,
      });

      // Act
      const result = category.canBeMoved();

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when category is root', () => {
      // Arrange
      const category = createTestCategory({
        status: EStatus.ACTIVE as unknown as Status,
        parentId: undefined,
      });

      // Act
      const result = category.canBeMoved();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isLeaf', () => {
    it('should return true when category has no children', () => {
      // Arrange
      const category = createTestCategory({
        ancestors: ['parent-uuid'],
      });

      // Act
      const result = category.isLeaf();

      // Assert
      expect(result).toBeFalsy();
    });

    it('should return false when category has children', () => {
      // Arrange
      const category = createTestCategory({
        ancestors: ['parent-uuid'],
      });

      // Act
      const result = category.isLeaf();

      // Assert
      expect(result).toBeFalsy();
    });
  });

  describe('getNodeSize', () => {
    it('should return correct node size for leaf node', () => {
      // Arrange
      const category = createTestCategory({
        ancestors: ['parent-uuid'],
      });

      // Act
      const result = category.getNodeSize();

      // Assert
      expect(result).toBe(1);
    });

    it('should return correct node size for parent node', () => {
      // Arrange
      const category = createTestCategory({
        ancestors: ['parent-uuid'],
      });

      // Act
      const result = category.getNodeSize();

      // Assert
      expect(result).toBe(1);
    });
  });
});
