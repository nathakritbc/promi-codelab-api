import { EStatus, type Brand, type CreatedAt, type Status, type UpdatedAt } from 'src/types/utility.type';

// Branded types for type safety
export type CategoryId = Brand<string, 'CategoryId'>;
export type CategoryName = Brand<string, 'CategoryName'>;
export type CategoryParentId = Brand<string, 'CategoryParentId'>;
export type CategoryLft = Brand<number, 'CategoryLft'>;
export type CategoryRgt = Brand<number, 'CategoryRgt'>;
export type CategoryCreatedAt = Brand<CreatedAt, 'CategoryCreatedAt'>;
export type CategoryUpdatedAt = Brand<UpdatedAt, 'CategoryUpdatedAt'>;

export interface ICategory {
  uuid: CategoryId;
  name: CategoryName;
  parentId?: CategoryParentId;
  lft: CategoryLft;
  rgt: CategoryRgt;
  status: Status;
  createdAt?: CategoryCreatedAt;
  updatedAt?: CategoryUpdatedAt;
}

export class Category implements ICategory {
  uuid: CategoryId;
  name: CategoryName;
  parentId?: CategoryParentId;
  lft: CategoryLft;
  rgt: CategoryRgt;
  status: Status;
  createdAt?: CategoryCreatedAt;
  updatedAt?: CategoryUpdatedAt;

  // Business logic methods
  isActive(): boolean {
    return this.status === (EStatus.ACTIVE as Status);
  }

  isRoot(): boolean {
    return !this.parentId;
  }

  hasChildren(): boolean {
    return this.rgt > this.lft + 1;
  }

  getDepth(): number {
    if (this.isRoot()) return 0;
    // Depth calculation would need parent traversal in real implementation
    return 1; // Simplified for now
  }

  canBeDeleted(): boolean {
    return this.status !== (EStatus.DELETED as Status) && !this.hasChildren();
  }

  canBeMoved(): boolean {
    return this.isActive() && !this.isRoot();
  }

  isLeaf(): boolean {
    return !this.hasChildren();
  }

  getNodeSize(): number {
    return this.rgt - this.lft + 1;
  }
}
