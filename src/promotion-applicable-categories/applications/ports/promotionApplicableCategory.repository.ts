import { GetAllMetaType, GetAllParamsType } from 'src/types/utility.type';
import {
  CategoryId,
  IPromotionApplicableCategory,
  PromotionApplicableCategoryId,
  PromotionId,
} from '../domains/promotionApplicableCategory.domain';

export type CreatePromotionApplicableCategoryCommand = Omit<
  IPromotionApplicableCategory,
  'uuid' | 'createdAt' | 'updatedAt'
>;

export type UpdatePromotionApplicableCategoryCommand = Partial<
  Omit<IPromotionApplicableCategory, 'uuid' | 'createdAt' | 'updatedAt'>
>;

export interface GetAllPromotionApplicableCategoriesReturnType {
  result: IPromotionApplicableCategory[];
  meta: GetAllMetaType;
}

export interface GetAllPromotionApplicableCategoriesQuery extends GetAllParamsType {
  promotionId?: string;
  categoryId?: string;
  status?: string;
  includeChildren?: boolean;
}

const promotionApplicableCategoryRepositoryTokenSymbol: unique symbol = Symbol('PromotionApplicableCategoryRepository');
export const promotionApplicableCategoryRepositoryToken = promotionApplicableCategoryRepositoryTokenSymbol.toString();

export interface PromotionApplicableCategoryRepository {
  createPromotionApplicableCategory(
    promotionApplicableCategory: IPromotionApplicableCategory,
  ): Promise<IPromotionApplicableCategory>;
  deletePromotionApplicableCategoryById({ id }: { id: PromotionApplicableCategoryId }): Promise<void>;
  getAllPromotionApplicableCategories(
    params: GetAllPromotionApplicableCategoriesQuery,
  ): Promise<GetAllPromotionApplicableCategoriesReturnType>;
  getPromotionApplicableCategoryById({
    id,
  }: {
    id: PromotionApplicableCategoryId;
  }): Promise<IPromotionApplicableCategory | undefined>;
  updatePromotionApplicableCategoryById(
    promotionApplicableCategory: IPromotionApplicableCategory,
  ): Promise<IPromotionApplicableCategory>;
  getPromotionApplicableCategoriesByPromotionId({
    promotionId,
  }: {
    promotionId: PromotionId;
  }): Promise<IPromotionApplicableCategory[]>;
  getPromotionApplicableCategoriesByCategoryId({
    categoryId,
  }: {
    categoryId: CategoryId;
  }): Promise<IPromotionApplicableCategory[]>;
  getPromotionApplicableCategoryByAssociation({
    promotionId,
    categoryId,
  }: {
    promotionId: PromotionId;
    categoryId: CategoryId;
  }): Promise<IPromotionApplicableCategory | undefined>;
}
