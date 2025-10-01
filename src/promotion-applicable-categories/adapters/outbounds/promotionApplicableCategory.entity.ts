import { CategoryEntity } from 'src/categories/adapters/outbounds/category.entity';
import type {
  CategoryId,
  PromotionApplicableCategoryCreatedAt,
  PromotionApplicableCategoryId,
  PromotionApplicableCategoryUpdatedAt,
  PromotionId,
} from 'src/promotion-applicable-categories/applications/domains/promotionApplicableCategory.domain';
import { PromotionEntity } from 'src/promotions/adapters/outbounds/promotion.entity';
import type { Status } from 'src/types/utility.type';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';

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

  // Foreign Key Relationships
  @ManyToOne(() => PromotionEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'promotion_id' })
  promotion?: PromotionEntity;

  @ManyToOne(() => CategoryEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category?: CategoryEntity;

  @Column({ type: 'boolean', name: 'include_children', default: true })
  includeChildren: boolean;

  @Column({ type: 'varchar', default: 'active' })
  status: Status;

  @CreateDateColumn({ name: 'created_at' })
  declare createdAt: PromotionApplicableCategoryCreatedAt;

  @UpdateDateColumn({ name: 'updated_at' })
  declare updatedAt: PromotionApplicableCategoryUpdatedAt;
}
