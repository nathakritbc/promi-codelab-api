import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Injectable } from '@nestjs/common';
import { Builder, StrictBuilder } from 'builder-pattern';
import { isEmpty } from 'radash';
import { EStatus, type Status } from 'src/types/utility.type';
import { Not } from 'typeorm';
import { paginateQueryBuilder, PaginationParams } from '../../../utils/pagination.util';
import type {
  CategoryCreatedAt,
  CategoryId,
  CategoryName,
  CategoryParentId,
  CategoryTreeId,
  CategoryUpdatedAt,
  ICategory,
} from '../../applications/domains/category.domain';
import type { GetAllCategoriesQuery, GetAllCategoriesReturnType } from '../../applications/ports/category.repository';
import { CategoryRepository } from '../../applications/ports/category.repository';
import { CategoryEntity } from './category.entity';

@Injectable()
export class CategoryTypeOrmRepository implements CategoryRepository {
  constructor(private readonly categoryModel: TransactionHost<TransactionalAdapterTypeOrm>) {}

  async createCategory(category: ICategory): Promise<ICategory> {
    const resultCreated = await this.categoryModel.tx.getRepository(CategoryEntity).save(category);
    return CategoryTypeOrmRepository.toDomain(resultCreated as CategoryEntity);
  }

  async deleteCategoryById({ id }: { id: CategoryId }): Promise<void> {
    await this.categoryModel.tx.getRepository(CategoryEntity).update({ uuid: id }, { status: EStatus.DELETED });
  }

  async getAllCategories(params: GetAllCategoriesQuery): Promise<GetAllCategoriesReturnType> {
    const { search, sort, order, page, limit, status, parentId, isRoot } = params;

    const repo = this.categoryModel.tx.getRepository(CategoryEntity);
    const qb = repo.createQueryBuilder('category');

    qb.andWhere('category.status != :deletedStatus', { deletedStatus: EStatus.DELETED });

    // Apply filters
    if (search) {
      qb.andWhere('(category.name ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (status && status !== EStatus.DELETED) {
      qb.andWhere('category.status = :status', { status });
    }

    if (parentId) {
      qb.andWhere('category.parentId = :parentId', { parentId });
    }

    if (isRoot !== undefined) {
      const condition = isRoot ? 'category.parentId IS NULL' : 'category.parentId IS NOT NULL';
      qb.andWhere(condition);
    }

    // Sorting
    const sortableColumns = ['name', 'status', 'createdAt'];
    const isValidSort = sort && sortableColumns.includes(sort);
    const sortOrder = order === 'ASC' ? 'ASC' : 'DESC';

    if (isValidSort) {
      const columnMap: Record<string, string> = {
        createdAt: 'created_at',
      };
      const dbColumn = columnMap[sort] || sort;
      qb.orderBy(`category.${dbColumn}`, sortOrder);
    } else {
      qb.orderBy('category.name', 'ASC'); // Default: alphabetical order
    }

    const paginationParams = StrictBuilder<PaginationParams>().page(page).limit(limit).build();

    const { records: categories, meta } = await paginateQueryBuilder(qb, paginationParams);

    const result = categories.map((category) => CategoryTypeOrmRepository.toDomain(category));

    return StrictBuilder<GetAllCategoriesReturnType>().result(result).meta(meta).build();
  }

  async getCategoryById({ id }: { id: CategoryId }): Promise<ICategory | undefined> {
    const category = await this.categoryModel.tx.getRepository(CategoryEntity).findOne({
      where: { uuid: id, status: Not(EStatus.DELETED as Status) },
    });

    if (!category) return undefined;

    return CategoryTypeOrmRepository.toDomain(category);
  }

  async getCategoriesByParentId({ parentId }: { parentId: string }): Promise<ICategory[]> {
    const categories = await this.categoryModel.tx.getRepository(CategoryEntity).find({
      where: { parentId: parentId as CategoryParentId, status: Not(EStatus.DELETED as Status) },
      // order: { lft: 'ASC' },
    });

    return isEmpty(categories) ? [] : categories.map((category) => CategoryTypeOrmRepository.toDomain(category));
  }

  async updateCategoryById(category: ICategory): Promise<ICategory> {
    await this.categoryModel.tx.getRepository(CategoryEntity).update({ uuid: category.uuid }, category);

    const updatedCategory = await this.categoryModel.tx.getRepository(CategoryEntity).findOne({
      where: { uuid: category.uuid },
    });

    return CategoryTypeOrmRepository.toDomain(updatedCategory as CategoryEntity);
  }

  public static toDomain(categoryEntity: CategoryEntity): ICategory {
    const ancestors = categoryEntity.ancestors;
    return Builder<ICategory>()
      .uuid(categoryEntity.uuid as CategoryId)
      .name(categoryEntity.name as CategoryName)
      .parentId(categoryEntity.parentId as CategoryParentId)
      .ancestors(ancestors as string[])
      .status(categoryEntity.status as Status)
      .treeId(categoryEntity.treeId as CategoryTreeId)
      .createdAt(categoryEntity.createdAt as CategoryCreatedAt)
      .updatedAt(categoryEntity.updatedAt as CategoryUpdatedAt)
      .build();
  }
}
