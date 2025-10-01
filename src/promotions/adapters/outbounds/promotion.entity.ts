import type {
  DiscountType,
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
} from 'src/promotions/applications/domains/promotion.domain';
import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

export const PromotionTableName = 'promotions';

@Entity({ name: PromotionTableName })
export class PromotionEntity {
  @PrimaryColumn({
    type: 'uuid',
    name: 'uuid',
    default: 'gen_random_uuid()',
  })
  uuid: PromotionId;

  @Column({ type: 'varchar' })
  name: PromotionName;

  @Column({ type: 'varchar', default: 'draft' })
  status: PromotionStatus;

  @Column({ type: 'timestamp', name: 'starts_at' })
  startsAt: PromotionStartsAt;

  @Column({ type: 'timestamp', name: 'ends_at' })
  endsAt: PromotionEndsAt;

  @Column({ type: 'varchar', name: 'discount_type', default: 'Percent' })
  discountType: DiscountType;

  @Column({ type: 'int', name: 'discount_value', default: 0 })
  discountValue: PromotionDiscountValue;

  @Column({ type: 'int', name: 'max_discount_amount', nullable: true, default: 0 })
  maxDiscountAmount?: PromotionMaxDiscountAmount;

  @Column({ type: 'int', default: 0 })
  priority: PromotionPriority;

  @CreateDateColumn({ name: 'created_at' })
  declare createdAt: PromotionCreatedAt;

  @UpdateDateColumn({ name: 'updated_at' })
  declare updatedAt: PromotionUpdatedAt;
}
