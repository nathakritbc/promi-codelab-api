import { GetAllMetaType, GetAllParamsType } from 'src/types/utility.type';
import { CategoryId, IProductCategory, ProductCategoryId, ProductId } from '../domains/productCategory.domain';

export type CreateProductCategoryCommand = Omit<IProductCategory, 'uuid' | 'createdAt' | 'updatedAt'>;

export type UpdateProductCategoryCommand = Partial<Omit<IProductCategory, 'uuid' | 'createdAt' | 'updatedAt'>>;

export interface GetAllProductCategoriesReturnType {
  result: IProductCategory[];
  meta: GetAllMetaType;
}

export interface GetAllProductCategoriesQuery extends GetAllParamsType {
  productId?: string;
  categoryId?: string;
  status?: string;
}

const productCategoryRepositoryTokenSymbol: unique symbol = Symbol('ProductCategoryRepository');
export const productCategoryRepositoryToken = productCategoryRepositoryTokenSymbol.toString();

export interface ProductCategoryRepository {
  createProductCategory(productCategory: IProductCategory): Promise<IProductCategory>;
  deleteProductCategoryById({ id }: { id: ProductCategoryId }): Promise<void>;
  getAllProductCategories(params: GetAllProductCategoriesQuery): Promise<GetAllProductCategoriesReturnType>;
  getProductCategoryById({ id }: { id: ProductCategoryId }): Promise<IProductCategory | undefined>;
  updateProductCategoryById(productCategory: IProductCategory): Promise<IProductCategory>;
  getProductCategoriesByProductId({ productId }: { productId: ProductId }): Promise<IProductCategory[]>;
  getProductCategoriesByCategoryId({ categoryId }: { categoryId: CategoryId }): Promise<IProductCategory[]>;
  getProductCategoryByAssociation({
    productId,
    categoryId,
  }: {
    productId: ProductId;
    categoryId: CategoryId;
  }): Promise<IProductCategory | undefined>;
}
