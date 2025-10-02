import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Injectable } from '@nestjs/common';
import { Builder, StrictBuilder } from 'builder-pattern';
import type { PromotionId } from 'src/promotions/applications/domains/promotion.domain';
import { paginateQueryBuilder, PaginationParams } from '../../../utils/pagination.util';
import type {
  IPromotionRule,
  PromotionRuleCreatedAt,
  PromotionRuleId,
  PromotionRuleMinAmount,
  PromotionRuleMinQty,
  PromotionRuleScope,
  PromotionRuleUpdatedAt,
} from '../../applications/domains/promotionRule.domain';
import type {
  GetAllPromotionRulesQuery,
  GetAllPromotionRulesReturnType,
} from '../../applications/ports/promotionRule.repository';
import { PromotionRuleRepository } from '../../applications/ports/promotionRule.repository';
import { PromotionRuleEntity } from './promotionRule.entity';

@Injectable()
export class PromotionRuleTypeOrmRepository implements PromotionRuleRepository {
  constructor(private readonly promotionRuleModel: TransactionHost<TransactionalAdapterTypeOrm>) {}

  async createPromotionRule(promotionRule: IPromotionRule): Promise<IPromotionRule> {
    const resultCreated = await this.promotionRuleModel.tx.getRepository(PromotionRuleEntity).save(promotionRule);
    return PromotionRuleTypeOrmRepository.toDomain(resultCreated as PromotionRuleEntity);
  }

  async deletePromotionRuleById({ id }: { id: PromotionRuleId }): Promise<void> {
    await this.promotionRuleModel.tx.getRepository(PromotionRuleEntity).delete({ uuid: id });
  }

  async getAllPromotionRules(params: GetAllPromotionRulesQuery): Promise<GetAllPromotionRulesReturnType> {
    const { sort, order, page, limit, promotionId, scope } = params;

    const repo = this.promotionRuleModel.tx.getRepository(PromotionRuleEntity);
    const qb = repo.createQueryBuilder('promotionRule');

    // Apply filters
    if (promotionId) {
      qb.andWhere('promotionRule.promotion_id = :promotionId', { promotionId });
    }

    if (scope) {
      qb.andWhere('promotionRule.scope = :scope', { scope });
    }

    // Sorting
    const sortableColumns = ['scope', 'minQty', 'minAmount', 'createdAt'];
    const isValidSort = sort && sortableColumns.includes(sort);
    const sortOrder = order === 'ASC' ? 'ASC' : 'DESC';

    if (isValidSort) {
      const columnMap: Record<string, string> = {
        minQty: 'min_qty',
        minAmount: 'min_amount',
        createdAt: 'created_at',
      };
      const dbColumn = columnMap[sort] || sort;
      qb.orderBy(`promotionRule.${dbColumn}`, sortOrder);
    } else {
      qb.orderBy('promotionRule.created_at', 'DESC');
    }

    const paginationParams = StrictBuilder<PaginationParams>().page(page).limit(limit).build();

    const { records: promotionRules, meta } = await paginateQueryBuilder(qb, paginationParams);

    const result = promotionRules.map((rule) => PromotionRuleTypeOrmRepository.toDomain(rule));

    return StrictBuilder<GetAllPromotionRulesReturnType>().result(result).meta(meta).build();
  }

  async getPromotionRuleById({ id }: { id: PromotionRuleId }): Promise<IPromotionRule | undefined> {
    const promotionRule = await this.promotionRuleModel.tx.getRepository(PromotionRuleEntity).findOne({
      where: { uuid: id },
    });

    if (!promotionRule) return undefined;

    return PromotionRuleTypeOrmRepository.toDomain(promotionRule);
  }

  async getPromotionRulesByPromotionId({ promotionId }: { promotionId: PromotionId }): Promise<IPromotionRule[]> {
    const rules = await this.promotionRuleModel.tx.getRepository(PromotionRuleEntity).find({
      where: { promotionId },
      order: { createdAt: 'DESC' },
    });

    return rules.map((rule) => PromotionRuleTypeOrmRepository.toDomain(rule));
  }

  async updatePromotionRuleById(promotionRule: IPromotionRule): Promise<IPromotionRule> {
    await this.promotionRuleModel.tx
      .getRepository(PromotionRuleEntity)
      .update({ uuid: promotionRule.uuid }, promotionRule);

    const updatedRule = await this.promotionRuleModel.tx.getRepository(PromotionRuleEntity).findOne({
      where: { uuid: promotionRule.uuid },
    });

    return PromotionRuleTypeOrmRepository.toDomain(updatedRule as PromotionRuleEntity);
  }

  public static toDomain(promotionRuleEntity: PromotionRuleEntity): IPromotionRule {
    return Builder<IPromotionRule>()
      .uuid(promotionRuleEntity.uuid as PromotionRuleId)
      .promotionId(promotionRuleEntity.promotionId as PromotionId)
      .scope(promotionRuleEntity.scope as PromotionRuleScope)
      .minQty(promotionRuleEntity.minQty as PromotionRuleMinQty)
      .minAmount(promotionRuleEntity.minAmount as PromotionRuleMinAmount)
      .createdAt(promotionRuleEntity.createdAt as PromotionRuleCreatedAt)
      .updatedAt(promotionRuleEntity.updatedAt as PromotionRuleUpdatedAt)
      .build();
  }
}
