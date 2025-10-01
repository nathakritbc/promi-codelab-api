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

  isSamePromotion(promotionId: PromotionId): boolean {
    return this.promotionId === promotionId;
  }

  isSameCategory(categoryId: CategoryId): boolean {
    return this.categoryId === categoryId;
  }

  isSameAssociation(promotionId: PromotionId, categoryId: CategoryId): boolean {
    return this.promotionId === promotionId && this.categoryId === categoryId;
  }

  isApplicableToCategory(categoryId: CategoryId): boolean {
    return this.isActive() && this.isSameCategory(categoryId);
  }

  isApplicableToPromotion(promotionId: PromotionId): boolean {
    return this.isActive() && this.isSamePromotion(promotionId);
  }

  shouldIncludeChildren(): boolean {
    return this.includeChildren === (true as IncludeChildren);
  }

  shouldExcludeChildren(): boolean {
    return this.includeChildren === (false as IncludeChildren);
  }

  toggleIncludeChildren(): IncludeChildren {
    return (this.includeChildren === (true as IncludeChildren) ? false : true) as IncludeChildren;
  }
}
