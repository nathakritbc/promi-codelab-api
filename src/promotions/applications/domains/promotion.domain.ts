import dayjs from 'dayjs';
import type { Brand, CreatedAt, UpdatedAt } from 'src/types/utility.type';

import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

// Branded types for type safety
export type PromotionId = Brand<string, 'PromotionId'>;
export type PromotionName = Brand<string, 'PromotionName'>;
export type PromotionStartsAt = Brand<Date, 'PromotionStartsAt'>;
export type PromotionEndsAt = Brand<Date, 'PromotionEndsAt'>;
export type PromotionDiscountValue = Brand<number, 'PromotionDiscountValue'>;
export type PromotionMaxDiscountAmount = Brand<number, 'PromotionMaxDiscountAmount'>;
export type PromotionPriority = Brand<number, 'PromotionPriority'>;
export type PromotionCreatedAt = Brand<CreatedAt, 'PromotionCreatedAt'>;
export type PromotionUpdatedAt = Brand<UpdatedAt, 'PromotionUpdatedAt'>;

// Enums
export enum EPromotionStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ENDED = 'ended',
}

export enum EDiscountType {
  PERCENT = 'Percent',
  FIXED = 'Fixed',
}

export type PromotionStatus = Brand<EPromotionStatus, 'PromotionStatus'>;
export type DiscountType = Brand<EDiscountType, 'DiscountType'>;

export interface IPromotion {
  uuid: PromotionId;
  name: PromotionName;
  status: PromotionStatus;
  startsAt: PromotionStartsAt;
  endsAt: PromotionEndsAt;
  discountType: DiscountType;
  discountValue: PromotionDiscountValue;
  maxDiscountAmount?: PromotionMaxDiscountAmount;
  priority: PromotionPriority;
  createdAt?: PromotionCreatedAt;
  updatedAt?: PromotionUpdatedAt;
}

export class Promotion implements IPromotion {
  uuid: PromotionId;
  name: PromotionName;
  status: PromotionStatus;
  startsAt: PromotionStartsAt;
  endsAt: PromotionEndsAt;
  discountType: DiscountType;
  discountValue: PromotionDiscountValue;
  maxDiscountAmount?: PromotionMaxDiscountAmount;
  priority: PromotionPriority;
  createdAt?: PromotionCreatedAt;
  updatedAt?: PromotionUpdatedAt;

  // Business logic methods
  isActive(): boolean {
    const now = dayjs();
    const isStatusActive = this.status === EPromotionStatus.ACTIVE;
    const hasStarted = dayjs(this.startsAt).isSameOrBefore(now);
    const hasNotEnded = dayjs(this.endsAt).isSameOrAfter(now);

    return isStatusActive && hasStarted && hasNotEnded;
  }

  calculateDiscount(amount: number): number {
    if (!this.isActive()) return 0;

    if (this.discountType === EDiscountType.FIXED) {
      return Math.min(this.discountValue, amount);
    }

    // Percent discount
    const discount = (amount * this.discountValue) / 100;
    if (this.maxDiscountAmount && this.maxDiscountAmount > 0) {
      return Math.min(discount, this.maxDiscountAmount);
    }

    return discount;
  }

  canBeModified(): boolean {
    return this.status !== EPromotionStatus.ENDED;
  }
}
