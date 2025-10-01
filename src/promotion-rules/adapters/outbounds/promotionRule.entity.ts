import type {
  PromotionRuleCreatedAt,
  PromotionRuleId,
  PromotionRuleMinAmount,
  PromotionRuleMinQty,
  PromotionRuleScope,
  PromotionRuleUpdatedAt,
} from 'src/promotion-rules/applications/domains/promotionRule.domain';
import { PromotionEntity } from 'src/promotions/adapters/outbounds/promotion.entity';
import type { PromotionId } from 'src/promotions/applications/domains/promotion.domain';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';

export const PromotionRuleTableName = 'promotion_rules';

@Entity({ name: PromotionRuleTableName })
export class PromotionRuleEntity {
  @PrimaryColumn({
    type: 'uuid',
    name: 'uuid',
    default: 'gen_random_uuid()',
  })
  uuid: PromotionRuleId;

  @Column({ type: 'uuid', name: 'promotion_id' })
  promotionId: PromotionId;

  @Column({ type: 'varchar', length: '50' })
  scope: PromotionRuleScope;

  @Column({ type: 'int', name: 'min_qty', nullable: true })
  minQty?: PromotionRuleMinQty;

  @Column({ type: 'int', name: 'min_amount', nullable: true })
  minAmount?: PromotionRuleMinAmount;

  @CreateDateColumn({ name: 'created_at' })
  declare createdAt: PromotionRuleCreatedAt;

  @UpdateDateColumn({ name: 'updated_at' })
  declare updatedAt: PromotionRuleUpdatedAt;

  // Relations
  @ManyToOne(() => PromotionEntity)
  @JoinColumn({ name: 'promotion_id' })
  promotion?: PromotionEntity;
}
