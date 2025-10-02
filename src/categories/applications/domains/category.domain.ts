import { EStatus, type Brand, type CreatedAt, type Status, type UpdatedAt } from 'src/types/utility.type';
import { v4 as uuid } from 'uuid';
// Branded types for type safety
export type CategoryId = Brand<string, 'CategoryId'>;
export type CategoryName = Brand<string, 'CategoryName'>;
export type CategoryParentId = Brand<string, 'CategoryParentId'>;
export type CategoryCreatedAt = Brand<CreatedAt, 'CategoryCreatedAt'>;
export type CategoryUpdatedAt = Brand<UpdatedAt, 'CategoryUpdatedAt'>;
export type CategoryTreeId = Brand<string, 'CategoryTreeId'>;

export interface ICategory {
  uuid: CategoryId;
  name: CategoryName;
  parentId?: CategoryParentId;
  ancestors: string[];
  treeId: CategoryTreeId;
  status: Status;
  createdAt?: CategoryCreatedAt;
  updatedAt?: CategoryUpdatedAt;
}

export class Category implements ICategory {
  uuid: CategoryId;
  name: CategoryName;
  parentId?: CategoryParentId;
  status: Status;
  ancestors: string[];
  treeId: CategoryTreeId;
  createdAt?: CategoryCreatedAt;
  updatedAt?: CategoryUpdatedAt;

  // Business logic methods

  createRootCategory(): void {
    const categoryId = uuid();
    const createdAtDateTime = new Date();

    this.uuid = categoryId as CategoryId;
    this.parentId = undefined;
    this.ancestors = [];
    this.status = EStatus.ACTIVE as Status;
    this.createdAt = createdAtDateTime as CategoryCreatedAt;
    this.updatedAt = createdAtDateTime as CategoryUpdatedAt;
    this.treeId = categoryId as CategoryTreeId;
  }

  isActive(): boolean {
    return this.status === (EStatus.ACTIVE as Status);
  }

  isRoot(): boolean {
    return !this.parentId;
  }

  hasChildren(): boolean {
    return this.ancestors.length > 0;
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
    return this.ancestors.length;
  }
}
