import { isEmpty } from 'radash';
import type { PromotionId } from 'src/promotions/applications/domains/promotion.domain';
import type { Brand, CreatedAt, UpdatedAt } from 'src/types/utility.type';

// Branded types for type safety
export type PromotionRuleId = Brand<string, 'PromotionRuleId'>;
export type PromotionRuleMinQty = Brand<number, 'PromotionRuleMinQty'>;
export type PromotionRuleMinAmount = Brand<number, 'PromotionRuleMinAmount'>;
export type PromotionRuleCreatedAt = Brand<CreatedAt, 'PromotionRuleCreatedAt'>;
export type PromotionRuleUpdatedAt = Brand<UpdatedAt, 'PromotionRuleUpdatedAt'>;

// Enums
export enum EPromotionRuleScope {
  PRODUCT = 'product',
  CATEGORY = 'category',
}

export type PromotionRuleScope = Brand<EPromotionRuleScope, 'PromotionRuleScope'>;

export interface IPromotionRule {
  uuid: PromotionRuleId;
  promotionId: PromotionId;
  scope: PromotionRuleScope;
  minQty?: PromotionRuleMinQty;
  minAmount?: PromotionRuleMinAmount;
  createdAt?: PromotionRuleCreatedAt;
  updatedAt?: PromotionRuleUpdatedAt;
}

export class PromotionRule implements IPromotionRule {
  uuid: PromotionRuleId;
  promotionId: PromotionId;
  scope: PromotionRuleScope;
  minQty?: PromotionRuleMinQty;
  minAmount?: PromotionRuleMinAmount;
  createdAt?: PromotionRuleCreatedAt;
  updatedAt?: PromotionRuleUpdatedAt;

  // Business logic methods
  hasMinimumQuantityRequirement(): boolean {
    if (isEmpty(this.minQty)) return false;
    const minQty = Number(this.minQty);
    return minQty > 0;
  }

  hasMinimumAmountRequirement(): boolean {
    if (isEmpty(this.minAmount)) return false;
    const minAmount = Number(this.minAmount);
    return minAmount > 0;
  }

  meetsQuantityRequirement(quantity: number): boolean {
    if (!this.hasMinimumQuantityRequirement()) return true;
    const minQty = this.minQty ? Number(this.minQty) : 0;
    return quantity >= minQty;
  }

  meetsAmountRequirement(amount: number): boolean {
    if (!this.hasMinimumAmountRequirement()) return true; // No requirement means always met
    const minAmount = this.minAmount ? Number(this.minAmount) : 0;
    return amount >= minAmount;
  }

  isApplicable(quantity: number, amount: number): boolean {
    return this.meetsQuantityRequirement(quantity) && this.meetsAmountRequirement(amount);
  }
}
