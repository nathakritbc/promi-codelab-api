import { GetAllMetaType, GetAllParamsType } from 'src/types/utility.type';
import { IPromotion, PromotionId } from '../domains/promotion.domain';

export type CreatePromotionCommand = Omit<IPromotion, 'uuid' | 'createdAt' | 'updatedAt'>;

export type UpdatePromotionCommand = Partial<Omit<IPromotion, 'uuid' | 'createdAt' | 'updatedAt'>>;

export interface GetAllPromotionsReturnType {
  result: IPromotion[];
  meta: GetAllMetaType;
}

export interface GetAllPromotionsQuery extends GetAllParamsType {
  status?: string;
  discountType?: string;
}

const promotionRepositoryTokenSymbol: unique symbol = Symbol('PromotionRepository');
export const promotionRepositoryToken = promotionRepositoryTokenSymbol.toString();

export interface PromotionRepository {
  createPromotion(promotion: IPromotion): Promise<IPromotion>;
  deletePromotionById({ id }: { id: PromotionId }): Promise<void>;
  getAllPromotions(params: GetAllPromotionsQuery): Promise<GetAllPromotionsReturnType>;
  getPromotionById({ id }: { id: PromotionId }): Promise<IPromotion | undefined>;
  updatePromotionById(promotion: IPromotion): Promise<IPromotion>;
}
