import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Injectable } from '@nestjs/common';
import { Builder, StrictBuilder } from 'builder-pattern';
import { paginateQueryBuilder, PaginationParams } from '../../../utils/pagination.util';
import type {
  DiscountType,
  IPromotion,
  PromotionCreatedAt,
  PromotionDiscountValue,
  PromotionEndsAt,
  PromotionId,
  PromotionMaxDiscountAmount,
  PromotionName,
  PromotionPriority,
  PromotionStartsAt,
  PromotionStatus,
  PromotionUpdatedAt,
} from '../../applications/domains/promotion.domain';
import type { GetAllPromotionsQuery, GetAllPromotionsReturnType } from '../../applications/ports/promotion.repository';
import { PromotionRepository } from '../../applications/ports/promotion.repository';
import { PromotionEntity } from './promotion.entity';

@Injectable()
export class PromotionTypeOrmRepository implements PromotionRepository {
  constructor(private readonly promotionModel: TransactionHost<TransactionalAdapterTypeOrm>) {}

  async createPromotion(promotion: IPromotion): Promise<IPromotion> {
    const resultCreated = await this.promotionModel.tx.getRepository(PromotionEntity).save(promotion);
    return PromotionTypeOrmRepository.toDomain(resultCreated as PromotionEntity);
  }

  async deletePromotionById({ id }: { id: PromotionId }): Promise<void> {
    await this.promotionModel.tx.getRepository(PromotionEntity).delete({ uuid: id });
  }

  async getAllPromotions(params: GetAllPromotionsQuery): Promise<GetAllPromotionsReturnType> {
    const { search, sort, order, page, limit, status, discountType } = params;

    const repo = this.promotionModel.tx.getRepository(PromotionEntity);
    const qb = repo.createQueryBuilder('promotion');

    // Apply filters
    if (search) {
      qb.andWhere('(promotion.name ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (status) {
      qb.andWhere('promotion.status = :status', { status });
    }

    if (discountType) {
      qb.andWhere('promotion.discount_type = :discountType', { discountType });
    }

    // Sorting
    const sortableColumns = ['name', 'status', 'startsAt', 'endsAt', 'priority', 'discountValue', 'createdAt'];
    const isValidSort = sort && sortableColumns.includes(sort);
    const sortOrder = order === 'ASC' ? 'ASC' : 'DESC';

    if (isValidSort) {
      // Map camelCase to snake_case for database columns
      const columnMap: Record<string, string> = {
        startsAt: 'starts_at',
        endsAt: 'ends_at',
        discountValue: 'discount_value',
        createdAt: 'created_at',
      };
      const dbColumn = columnMap[sort] || sort;
      qb.orderBy(`promotion.${dbColumn}`, sortOrder);
    } else {
      qb.orderBy('promotion.priority', 'DESC').addOrderBy('promotion.created_at', 'DESC');
    }

    const paginationParams = StrictBuilder<PaginationParams>().page(page).limit(limit).build();

    const { records: promotions, meta } = await paginateQueryBuilder(qb, paginationParams);

    // Map to domain objects
    const result = promotions.map((promotion) => PromotionTypeOrmRepository.toDomain(promotion));

    return StrictBuilder<GetAllPromotionsReturnType>().result(result).meta(meta).build();
  }

  async getPromotionById({ id }: { id: PromotionId }): Promise<IPromotion | undefined> {
    const promotion = await this.promotionModel.tx.getRepository(PromotionEntity).findOne({
      where: { uuid: id },
    });

    if (!promotion) return undefined;

    return PromotionTypeOrmRepository.toDomain(promotion);
  }

  async updatePromotionById(promotion: IPromotion): Promise<IPromotion> {
    await this.promotionModel.tx.getRepository(PromotionEntity).update({ uuid: promotion.uuid }, promotion);

    const updatedPromotion = await this.promotionModel.tx.getRepository(PromotionEntity).findOne({
      where: { uuid: promotion.uuid },
    });

    return PromotionTypeOrmRepository.toDomain(updatedPromotion as PromotionEntity);
  }

  public static toDomain(promotionEntity: PromotionEntity): IPromotion {
    return Builder<IPromotion>()
      .uuid(promotionEntity.uuid as PromotionId)
      .name(promotionEntity.name as PromotionName)
      .status(promotionEntity.status as PromotionStatus)
      .startsAt(promotionEntity.startsAt as PromotionStartsAt)
      .endsAt(promotionEntity.endsAt as PromotionEndsAt)
      .discountType(promotionEntity.discountType as DiscountType)
      .discountValue(promotionEntity.discountValue as PromotionDiscountValue)
      .maxDiscountAmount(promotionEntity.maxDiscountAmount as PromotionMaxDiscountAmount)
      .priority(promotionEntity.priority as PromotionPriority)
      .createdAt(promotionEntity.createdAt as PromotionCreatedAt)
      .updatedAt(promotionEntity.updatedAt as PromotionUpdatedAt)
      .build();
  }
}

