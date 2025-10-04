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
}
