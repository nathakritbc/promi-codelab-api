import { GetAllMetaType, GetAllParamsType } from 'src/types/utility.type';
import {
  IPromotionApplicableProduct,
  ProductId,
  PromotionApplicableProductId,
  PromotionId,
} from '../domains/promotionApplicableProduct.domain';

export type CreatePromotionApplicableProductCommand = Omit<
  IPromotionApplicableProduct,
  'uuid' | 'createdAt' | 'updatedAt'
>;

export type UpdatePromotionApplicableProductCommand = Partial<
  Omit<IPromotionApplicableProduct, 'uuid' | 'createdAt' | 'updatedAt'>
>;

export interface GetAllPromotionApplicableProductsReturnType {
  result: IPromotionApplicableProduct[];
  meta: GetAllMetaType;
}

export interface GetAllPromotionApplicableProductsQuery extends GetAllParamsType {
  promotionId?: string;
  productId?: string;
  status?: string;
}

const promotionApplicableProductRepositoryTokenSymbol: unique symbol = Symbol('PromotionApplicableProductRepository');
export const promotionApplicableProductRepositoryToken = promotionApplicableProductRepositoryTokenSymbol.toString();

export interface PromotionApplicableProductRepository {
  createPromotionApplicableProduct(
    promotionApplicableProduct: IPromotionApplicableProduct,
  ): Promise<IPromotionApplicableProduct>;
  deletePromotionApplicableProductById({ id }: { id: PromotionApplicableProductId }): Promise<void>;
  getAllPromotionApplicableProducts(
    params: GetAllPromotionApplicableProductsQuery,
  ): Promise<GetAllPromotionApplicableProductsReturnType>;
  getPromotionApplicableProductById({
    id,
  }: {
    id: PromotionApplicableProductId;
  }): Promise<IPromotionApplicableProduct | undefined>;
  updatePromotionApplicableProductById(
    promotionApplicableProduct: IPromotionApplicableProduct,
  ): Promise<IPromotionApplicableProduct>;
  getPromotionApplicableProductsByPromotionId({
    promotionId,
  }: {
    promotionId: PromotionId;
  }): Promise<IPromotionApplicableProduct[]>;
  getPromotionApplicableProductsByProductId({
    productId,
  }: {
    productId: ProductId;
  }): Promise<IPromotionApplicableProduct[]>;
  getPromotionApplicableProductByAssociation({
    promotionId,
    productId,
  }: {
    promotionId: PromotionId;
    productId: ProductId;
  }): Promise<IPromotionApplicableProduct | undefined>;
}
