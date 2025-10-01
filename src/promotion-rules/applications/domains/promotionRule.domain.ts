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
    return this.minQty !== undefined && this.minQty !== null && this.minQty > 0;
  }

  hasMinimumAmountRequirement(): boolean {
    return this.minAmount !== undefined && this.minAmount !== null && this.minAmount > 0;
  }

  meetsQuantityRequirement(quantity: number): boolean {
    if (!this.hasMinimumQuantityRequirement()) {
      return true; // No requirement means always met
    }
    return quantity >= (this.minQty || 0);
  }

  meetsAmountRequirement(amount: number): boolean {
    if (!this.hasMinimumAmountRequirement()) {
      return true; // No requirement means always met
    }
    return amount >= (this.minAmount || 0);
  }

  isApplicable(quantity: number, amount: number): boolean {
    return this.meetsQuantityRequirement(quantity) && this.meetsAmountRequirement(amount);
  }
}
