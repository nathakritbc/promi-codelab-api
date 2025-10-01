import type { PromotionId } from 'src/promotions/applications/domains/promotion.domain';
import { GetAllMetaType, GetAllParamsType } from 'src/types/utility.type';
import { IPromotionRule, PromotionRuleId } from '../domains/promotionRule.domain';

export type CreatePromotionRuleCommand = Omit<IPromotionRule, 'uuid' | 'createdAt' | 'updatedAt'>;

export type UpdatePromotionRuleCommand = Partial<
  Omit<IPromotionRule, 'uuid' | 'promotionId' | 'createdAt' | 'updatedAt'>
>;

export interface GetAllPromotionRulesReturnType {
  result: IPromotionRule[];
  meta: GetAllMetaType;
}

export interface GetAllPromotionRulesQuery extends GetAllParamsType {
  promotionId?: string;
  scope?: string;
}

const promotionRuleRepositoryTokenSymbol: unique symbol = Symbol('PromotionRuleRepository');
export const promotionRuleRepositoryToken = promotionRuleRepositoryTokenSymbol.toString();

export interface PromotionRuleRepository {
  createPromotionRule(promotionRule: IPromotionRule): Promise<IPromotionRule>;
  deletePromotionRuleById({ id }: { id: PromotionRuleId }): Promise<void>;
  getAllPromotionRules(params: GetAllPromotionRulesQuery): Promise<GetAllPromotionRulesReturnType>;
  getPromotionRuleById({ id }: { id: PromotionRuleId }): Promise<IPromotionRule | undefined>;
  getPromotionRulesByPromotionId({ promotionId }: { promotionId: PromotionId }): Promise<IPromotionRule[]>;
  updatePromotionRuleById(promotionRule: IPromotionRule): Promise<IPromotionRule>;
}
