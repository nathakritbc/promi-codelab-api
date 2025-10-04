import { EStatus, type Brand, type CreatedAt, type Status, type UpdatedAt } from 'src/types/utility.type';

// Branded types for type safety
export type PromotionApplicableCategoryId = Brand<string, 'PromotionApplicableCategoryId'>;
export type PromotionId = Brand<string, 'PromotionId'>;
export type CategoryId = Brand<string, 'CategoryId'>;
export type IncludeChildren = Brand<boolean, 'IncludeChildren'>;
export type PromotionApplicableCategoryCreatedAt = Brand<CreatedAt, 'PromotionApplicableCategoryCreatedAt'>;
export type PromotionApplicableCategoryUpdatedAt = Brand<UpdatedAt, 'PromotionApplicableCategoryUpdatedAt'>;

export interface IPromotionApplicableCategory {
  uuid: PromotionApplicableCategoryId;
  promotionId: PromotionId;
  categoryId: CategoryId;
  includeChildren: IncludeChildren;
  status: Status;
  createdAt?: PromotionApplicableCategoryCreatedAt;
  updatedAt?: PromotionApplicableCategoryUpdatedAt;
}

export class PromotionApplicableCategory implements IPromotionApplicableCategory {
  uuid: PromotionApplicableCategoryId;
  promotionId: PromotionId;
  categoryId: CategoryId;
  includeChildren: IncludeChildren;
  status: Status;
  createdAt?: PromotionApplicableCategoryCreatedAt;
  updatedAt?: PromotionApplicableCategoryUpdatedAt;

  // Business logic methods
  isActive(): boolean {
    return this.status === (EStatus.ACTIVE as Status);
  }

  shouldIncludeChildren(): boolean {
    return this.includeChildren === (true as IncludeChildren);
  }
}
