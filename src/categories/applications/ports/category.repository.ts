import { GetAllMetaType, GetAllParamsType } from 'src/types/utility.type';
import { CategoryId, ICategory } from '../domains/category.domain';

export type CreateCategoryCommand = Omit<ICategory, 'uuid' | 'createdAt' | 'updatedAt'>;

export type UpdateCategoryCommand = Partial<Omit<ICategory, 'uuid' | 'createdAt' | 'updatedAt'>>;

export interface GetAllCategoriesReturnType {
  result: ICategory[];
  meta: GetAllMetaType;
}

export interface GetAllCategoriesQuery extends GetAllParamsType {
  status?: string;
  parentId?: string;
  isRoot?: boolean;
  treeId?: string;
}

const categoryRepositoryTokenSymbol: unique symbol = Symbol('CategoryRepository');
export const categoryRepositoryToken = categoryRepositoryTokenSymbol.toString();

export interface CategoryRepository {
  createCategory(category: ICategory): Promise<ICategory>;
  deleteCategoryById({ id }: { id: CategoryId }): Promise<void>;
  getAllCategories(params: GetAllCategoriesQuery): Promise<GetAllCategoriesReturnType>;
  getCategoryById({ id }: { id: CategoryId }): Promise<ICategory | undefined>;
  getCategoriesByParentId({ parentId }: { parentId: string }): Promise<ICategory[]>;
  updateCategoryById(category: ICategory): Promise<ICategory>;
}
