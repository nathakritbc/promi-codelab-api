import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Injectable } from '@nestjs/common';
import { Builder, StrictBuilder } from 'builder-pattern';
import type { Status } from 'src/types/utility.type';
import { paginateQueryBuilder, PaginationParams } from '../../../utils/pagination.util';
import type {
  CategoryCreatedAt,
  CategoryId,
  CategoryLft,
  CategoryName,
  CategoryParentId,
  CategoryRgt,
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
    await this.categoryModel.tx.getRepository(CategoryEntity).delete({ uuid: id });
  }

  async getAllCategories(params: GetAllCategoriesQuery): Promise<GetAllCategoriesReturnType> {
    const { search, sort, order, page, limit, status, parentId, isRoot } = params;

    const repo = this.categoryModel.tx.getRepository(CategoryEntity);
    const qb = repo.createQueryBuilder('category');

    // Apply filters
    if (search) {
      qb.andWhere('(category.name ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (status) {
      qb.andWhere('category.status = :status', { status });
    }

    if (parentId) {
      qb.andWhere('category.parentId = :parentId', { parentId });
    }

    if (isRoot !== undefined) {
      if (isRoot) {
        qb.andWhere('category.parentId IS NULL');
      } else {
        qb.andWhere('category.parentId IS NOT NULL');
      }
    }

    // Sorting
    const sortableColumns = ['name', 'lft', 'rgt', 'status', 'createdAt'];
    const isValidSort = sort && sortableColumns.includes(sort);
    const sortOrder = order === 'ASC' ? 'ASC' : 'DESC';

    if (isValidSort) {
      const columnMap: Record<string, string> = {
        createdAt: 'created_at',
      };
      const dbColumn = columnMap[sort] || sort;
      qb.orderBy(`category.${dbColumn}`, sortOrder);
    } else {
      qb.orderBy('category.lft', 'ASC'); // Default: hierarchical order
    }

    const paginationParams = StrictBuilder<PaginationParams>().page(page).limit(limit).build();

    const { records: categories, meta } = await paginateQueryBuilder(qb, paginationParams);

    const result = categories.map((category) => CategoryTypeOrmRepository.toDomain(category));

    return StrictBuilder<GetAllCategoriesReturnType>().result(result).meta(meta).build();
  }

  async getCategoryById({ id }: { id: CategoryId }): Promise<ICategory | undefined> {
    const category = await this.categoryModel.tx.getRepository(CategoryEntity).findOne({
      where: { uuid: id },
    });

    if (!category) return undefined;

    return CategoryTypeOrmRepository.toDomain(category);
  }

  async getCategoriesByParentId({ parentId }: { parentId: string }): Promise<ICategory[]> {
    const categories = await this.categoryModel.tx.getRepository(CategoryEntity).find({
      where: { parentId: parentId as CategoryParentId },
      order: { lft: 'ASC' },
    });

    return categories.map((category) => CategoryTypeOrmRepository.toDomain(category));
  }

  async updateCategoryById(category: ICategory): Promise<ICategory> {
    await this.categoryModel.tx.getRepository(CategoryEntity).update({ uuid: category.uuid }, category);

    const updatedCategory = await this.categoryModel.tx.getRepository(CategoryEntity).findOne({
      where: { uuid: category.uuid },
    });

    return CategoryTypeOrmRepository.toDomain(updatedCategory as CategoryEntity);
  }

  public static toDomain(categoryEntity: CategoryEntity): ICategory {
    return Builder<ICategory>()
      .uuid(categoryEntity.uuid as CategoryId)
      .name(categoryEntity.name as CategoryName)
      .parentId(categoryEntity.parentId as CategoryParentId)
      .lft(categoryEntity.lft as CategoryLft)
      .rgt(categoryEntity.rgt as CategoryRgt)
      .status(categoryEntity.status as Status)
      .createdAt(categoryEntity.createdAt as CategoryCreatedAt)
      .updatedAt(categoryEntity.updatedAt as CategoryUpdatedAt)
      .build();
  }
}
