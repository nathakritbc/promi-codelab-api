import { ProductCategory } from 'src/product-categories/applications/domains/productCategory.domain';
import { EStatus, type Brand, type CreatedAt, type Status, type UpdatedAt } from 'src/types/utility.type';

// Branded types for type safety
export type ProductId = Brand<string, 'ProductId'>;
export type ProductCode = Brand<string, 'ProductCode'>;
export type ProductName = Brand<string, 'ProductName'>;
export type ProductDescription = Brand<string, 'ProductDescription'>;
export type ProductPrice = Brand<number, 'ProductPrice'>;
export type ProductCreatedAt = Brand<CreatedAt, 'ProductCreatedAt'>;
export type ProductUpdatedAt = Brand<UpdatedAt, 'ProductUpdatedAt'>;

export interface IProduct {
  uuid: ProductId;
  code: ProductCode;
  name: ProductName;
  description?: ProductDescription;
  price: ProductPrice;
  status: Status;
  productCategories?: ProductCategory[];
  createdAt?: ProductCreatedAt;
  updatedAt?: ProductUpdatedAt;
}

export class Product implements IProduct {
  uuid: ProductId;
  code: ProductCode;
  name: ProductName;
  description?: ProductDescription;
  price: ProductPrice;
  status: Status;
  productCategories: ProductCategory[];
  createdAt?: ProductCreatedAt;
  updatedAt?: ProductUpdatedAt;

  // Business logic methods
  isActive(): boolean {
    return this.status === (EStatus.ACTIVE as Status);
  }

  isAvailable(): boolean {
    return this.isActive() && this.price > 0;
  }

  canBeDeleted(): boolean {
    return this.status !== (EStatus.DELETED as Status);
  }

  calculateDiscountedPrice(discountPercent: number): number {
    if (!this.isActive()) {
      return this.price;
    }
    const discount = (this.price * discountPercent) / 100;
    return this.price - discount;
  }
}
