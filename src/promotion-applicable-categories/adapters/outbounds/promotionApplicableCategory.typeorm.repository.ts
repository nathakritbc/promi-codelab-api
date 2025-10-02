import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Injectable } from '@nestjs/common';
import { Builder, StrictBuilder } from 'builder-pattern';
import { EStatus, type Status } from 'src/types/utility.type';
import { paginateQueryBuilder, PaginationParams } from '../../../utils/pagination.util';
import type {
  CategoryId,
  IPromotionApplicableCategory,
  PromotionApplicableCategoryCreatedAt,
  PromotionApplicableCategoryId,
  PromotionApplicableCategoryUpdatedAt,
  PromotionId,
} from '../../applications/domains/promotionApplicableCategory.domain';
import type {
  GetAllPromotionApplicableCategoriesQuery,
  GetAllPromotionApplicableCategoriesReturnType,
} from '../../applications/ports/promotionApplicableCategory.repository';
import { PromotionApplicableCategoryRepository } from '../../applications/ports/promotionApplicableCategory.repository';
import { PromotionApplicableCategoryEntity } from './promotionApplicableCategory.entity';

@Injectable()
export class PromotionApplicableCategoryTypeOrmRepository implements PromotionApplicableCategoryRepository {
  constructor(private readonly promotionApplicableCategoryModel: TransactionHost<TransactionalAdapterTypeOrm>) {}

  async createPromotionApplicableCategory(
    promotionApplicableCategory: IPromotionApplicableCategory,
  ): Promise<IPromotionApplicableCategory> {
    const resultCreated = await this.promotionApplicableCategoryModel.tx
      .getRepository(PromotionApplicableCategoryEntity)
      .save(promotionApplicableCategory);
    return PromotionApplicableCategoryTypeOrmRepository.toDomain(resultCreated as PromotionApplicableCategoryEntity);
  }

  async deletePromotionApplicableCategoryById({ id }: { id: PromotionApplicableCategoryId }): Promise<void> {
    await this.promotionApplicableCategoryModel.tx
      .getRepository(PromotionApplicableCategoryEntity)
      .delete({ uuid: id });
  }

  async getAllPromotionApplicableCategories(
    params: GetAllPromotionApplicableCategoriesQuery,
  ): Promise<GetAllPromotionApplicableCategoriesReturnType> {
    const { search, sort, order, page, limit, promotionId, categoryId, status, includeChildren } = params;

    const repo = this.promotionApplicableCategoryModel.tx.getRepository(PromotionApplicableCategoryEntity);
    const qb = repo.createQueryBuilder('promotionApplicableCategory');

    qb.andWhere('promotionApplicableCategory.status != :deleteStatus', { deleteStatus: EStatus.DELETED });

    // Apply filters
    if (search) {
      qb.andWhere(
        '(promotionApplicableCategory.promotionId ILIKE :search OR promotionApplicableCategory.categoryId ILIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    // Apply filters
    if (promotionId) {
      qb.andWhere('promotionApplicableCategory.promotionId = :promotionId', { promotionId });
    }

    if (categoryId) {
      qb.andWhere('promotionApplicableCategory.categoryId = :categoryId', { categoryId });
    }

    if (status) {
      qb.andWhere('promotionApplicableCategory.status = :status', { status });
    }

    if (includeChildren !== undefined) {
      qb.andWhere('promotionApplicableCategory.includeChildren = :includeChildren', { includeChildren });
    }

    // Sorting
    const sortableColumns = ['promotionId', 'categoryId', 'status', 'includeChildren', 'createdAt'];
    const isValidSort = sort && sortableColumns.includes(sort);
    const sortOrder = order === 'ASC' ? 'ASC' : 'DESC';

    if (isValidSort) {
      const columnMap: Record<string, string> = {
        promotionId: 'promotion_id',
        categoryId: 'category_id',
        includeChildren: 'include_children',
        createdAt: 'created_at',
      };
      const dbColumn = columnMap[sort] || sort;
      qb.orderBy(`promotionApplicableCategory.${dbColumn}`, sortOrder);
    } else {
      qb.orderBy('promotionApplicableCategory.created_at', 'DESC'); // Default: newest first
    }

    const paginationParams = StrictBuilder<PaginationParams>().page(page).limit(limit).build();

    const { records: promotionApplicableCategories, meta } = await paginateQueryBuilder(qb, paginationParams);

    const result = promotionApplicableCategories.map((promotionApplicableCategory) =>
      PromotionApplicableCategoryTypeOrmRepository.toDomain(promotionApplicableCategory),
    );

    return StrictBuilder<GetAllPromotionApplicableCategoriesReturnType>().result(result).meta(meta).build();
  }

  async getPromotionApplicableCategoryById({
    id,
  }: {
    id: PromotionApplicableCategoryId;
  }): Promise<IPromotionApplicableCategory | undefined> {
    const promotionApplicableCategory = await this.promotionApplicableCategoryModel.tx
      .getRepository(PromotionApplicableCategoryEntity)
      .findOne({
        where: { uuid: id },
      });

    if (!promotionApplicableCategory) return undefined;

    return PromotionApplicableCategoryTypeOrmRepository.toDomain(promotionApplicableCategory);
  }

  async getPromotionApplicableCategoriesByPromotionId({
    promotionId,
  }: {
    promotionId: PromotionId;
  }): Promise<IPromotionApplicableCategory[]> {
    const promotionApplicableCategories = await this.promotionApplicableCategoryModel.tx
      .getRepository(PromotionApplicableCategoryEntity)
      .find({
        where: { promotionId },
        order: { createdAt: 'DESC' },
      });

    return promotionApplicableCategories.map((promotionApplicableCategory) =>
      PromotionApplicableCategoryTypeOrmRepository.toDomain(promotionApplicableCategory),
    );
  }

  async getPromotionApplicableCategoriesByCategoryId({
    categoryId,
  }: {
    categoryId: CategoryId;
  }): Promise<IPromotionApplicableCategory[]> {
    const promotionApplicableCategories = await this.promotionApplicableCategoryModel.tx
      .getRepository(PromotionApplicableCategoryEntity)
      .find({
        where: { categoryId },
        order: { createdAt: 'DESC' },
      });

    return promotionApplicableCategories.map((promotionApplicableCategory) =>
      PromotionApplicableCategoryTypeOrmRepository.toDomain(promotionApplicableCategory),
    );
  }

  async getPromotionApplicableCategoryByAssociation({
    promotionId,
    categoryId,
  }: {
    promotionId: PromotionId;
    categoryId: CategoryId;
  }): Promise<IPromotionApplicableCategory | undefined> {
    const promotionApplicableCategory = await this.promotionApplicableCategoryModel.tx
      .getRepository(PromotionApplicableCategoryEntity)
      .findOne({
        where: { promotionId, categoryId },
      });

    if (!promotionApplicableCategory) return undefined;

    return PromotionApplicableCategoryTypeOrmRepository.toDomain(promotionApplicableCategory);
  }

  async updatePromotionApplicableCategoryById(
    promotionApplicableCategory: IPromotionApplicableCategory,
  ): Promise<IPromotionApplicableCategory> {
    await this.promotionApplicableCategoryModel.tx
      .getRepository(PromotionApplicableCategoryEntity)
      .update({ uuid: promotionApplicableCategory.uuid }, promotionApplicableCategory);

    const updatedPromotionApplicableCategory = await this.promotionApplicableCategoryModel.tx
      .getRepository(PromotionApplicableCategoryEntity)
      .findOne({
        where: { uuid: promotionApplicableCategory.uuid },
      });

    return PromotionApplicableCategoryTypeOrmRepository.toDomain(
      updatedPromotionApplicableCategory as PromotionApplicableCategoryEntity,
    );
  }

  public static toDomain(
    promotionApplicableCategoryEntity: PromotionApplicableCategoryEntity,
  ): IPromotionApplicableCategory {
    return Builder<IPromotionApplicableCategory>()
      .uuid(promotionApplicableCategoryEntity.uuid as PromotionApplicableCategoryId)
      .promotionId(promotionApplicableCategoryEntity.promotionId as PromotionId)
      .categoryId(promotionApplicableCategoryEntity.categoryId as CategoryId)
      .includeChildren(promotionApplicableCategoryEntity.includeChildren as any)
      .status(promotionApplicableCategoryEntity.status as Status)
      .createdAt(promotionApplicableCategoryEntity.createdAt as PromotionApplicableCategoryCreatedAt)
      .updatedAt(promotionApplicableCategoryEntity.updatedAt as PromotionApplicableCategoryUpdatedAt)
      .build();
  }
}
