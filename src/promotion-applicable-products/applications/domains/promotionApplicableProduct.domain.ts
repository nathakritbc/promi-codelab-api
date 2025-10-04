import { EStatus, type Brand, type CreatedAt, type Status, type UpdatedAt } from 'src/types/utility.type';

// Branded types for type safety
export type PromotionApplicableProductId = Brand<string, 'PromotionApplicableProductId'>;
export type PromotionId = Brand<string, 'PromotionId'>;
export type ProductId = Brand<string, 'ProductId'>;
export type PromotionApplicableProductCreatedAt = Brand<CreatedAt, 'PromotionApplicableProductCreatedAt'>;
export type PromotionApplicableProductUpdatedAt = Brand<UpdatedAt, 'PromotionApplicableProductUpdatedAt'>;

export interface IPromotionApplicableProduct {
  uuid: PromotionApplicableProductId;
  promotionId: PromotionId;
  productId: ProductId;
  status: Status;
  createdAt?: PromotionApplicableProductCreatedAt;
  updatedAt?: PromotionApplicableProductUpdatedAt;
}

export class PromotionApplicableProduct implements IPromotionApplicableProduct {
  uuid: PromotionApplicableProductId;
  promotionId: PromotionId;
  productId: ProductId;
  status: Status;
  createdAt?: PromotionApplicableProductCreatedAt;
  updatedAt?: PromotionApplicableProductUpdatedAt;

  // Business logic methods
  isActive(): boolean {
    return this.status === (EStatus.ACTIVE as Status);
  }
}
