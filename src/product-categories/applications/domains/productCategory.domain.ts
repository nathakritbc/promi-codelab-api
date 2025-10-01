import { EStatus, type Brand, type CreatedAt, type Status, type UpdatedAt } from 'src/types/utility.type';

// Branded types for type safety
export type ProductCategoryId = Brand<string, 'ProductCategoryId'>;
export type ProductId = Brand<string, 'ProductId'>;
export type CategoryId = Brand<string, 'CategoryId'>;
export type ProductCategoryCreatedAt = Brand<CreatedAt, 'ProductCategoryCreatedAt'>;
export type ProductCategoryUpdatedAt = Brand<UpdatedAt, 'ProductCategoryUpdatedAt'>;

export interface IProductCategory {
  uuid: ProductCategoryId;
  productId: ProductId;
  categoryId: CategoryId;
  status: Status;
  createdAt?: ProductCategoryCreatedAt;
  updatedAt?: ProductCategoryUpdatedAt;
}

export class ProductCategory implements IProductCategory {
  uuid: ProductCategoryId;
  productId: ProductId;
  categoryId: CategoryId;
  status: Status;
  createdAt?: ProductCategoryCreatedAt;
  updatedAt?: ProductCategoryUpdatedAt;

  // Business logic methods
  isActive(): boolean {
    return this.status === (EStatus.ACTIVE as Status);
  }

  isInactive(): boolean {
    return this.status === (EStatus.INACTIVE as Status);
  }

  canBeDeleted(): boolean {
    return this.status !== (EStatus.DELETED as Status);
  }

  canBeActivated(): boolean {
    return this.status === (EStatus.INACTIVE as Status);
  }

  canBeDeactivated(): boolean {
    return this.status === (EStatus.ACTIVE as Status);
  }

  isSameProduct(productId: ProductId): boolean {
    return this.productId === productId;
  }

  isSameCategory(categoryId: CategoryId): boolean {
    return this.categoryId === categoryId;
  }

  isSameAssociation(productId: ProductId, categoryId: CategoryId): boolean {
    return this.productId === productId && this.categoryId === categoryId;
  }
}
