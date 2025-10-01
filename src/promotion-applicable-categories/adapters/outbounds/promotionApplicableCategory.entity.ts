import type {
  CategoryId,
  PromotionApplicableCategoryCreatedAt,
  PromotionApplicableCategoryId,
  PromotionApplicableCategoryUpdatedAt,
  PromotionId,
} from 'src/promotion-applicable-categories/applications/domains/promotionApplicableCategory.domain';
import type { Status } from 'src/types/utility.type';
import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

export const PromotionApplicableCategoryTableName = 'promotion_applicable_categories';

@Entity({ name: PromotionApplicableCategoryTableName })
export class PromotionApplicableCategoryEntity {
  @PrimaryColumn({
    type: 'uuid',
    name: 'uuid',
    default: 'gen_random_uuid()',
  })
  uuid: PromotionApplicableCategoryId;

  @Column({ type: 'uuid', name: 'promotion_id' })
  promotionId: PromotionId;

  @Column({ type: 'uuid', name: 'category_id' })
  categoryId: CategoryId;

  @Column({ type: 'boolean', name: 'include_children', default: true })
  includeChildren: boolean;

  @Column({ type: 'varchar', default: 'active' })
  status: Status;

  @CreateDateColumn({ name: 'created_at' })
  declare createdAt: PromotionApplicableCategoryCreatedAt;

  @UpdateDateColumn({ name: 'updated_at' })
  declare updatedAt: PromotionApplicableCategoryUpdatedAt;
}
