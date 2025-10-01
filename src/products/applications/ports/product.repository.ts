import { GetAllMetaType, GetAllParamsType } from 'src/types/utility.type';
import { IProduct, ProductId } from '../domains/product.domain';

export type CreateProductCommand = Omit<IProduct, 'uuid' | 'createdAt' | 'updatedAt'>;

export type UpdateProductCommand = Partial<Omit<IProduct, 'uuid' | 'code' | 'createdAt' | 'updatedAt'>>;

export interface GetAllProductsReturnType {
  result: IProduct[];
  meta: GetAllMetaType;
}

export interface GetAllProductsQuery extends GetAllParamsType {
  status?: string;
  minPrice?: number;
  maxPrice?: number;
}

const productRepositoryTokenSymbol: unique symbol = Symbol('ProductRepository');
export const productRepositoryToken = productRepositoryTokenSymbol.toString();

export interface ProductRepository {
  createProduct(product: IProduct): Promise<IProduct>;
  deleteProductById({ id }: { id: ProductId }): Promise<void>;
  getAllProducts(params: GetAllProductsQuery): Promise<GetAllProductsReturnType>;
  getProductById({ id }: { id: ProductId }): Promise<IProduct | undefined>;
  getProductByCode({ code }: { code: string }): Promise<IProduct | undefined>;
  updateProductById(product: IProduct): Promise<IProduct>;
}
