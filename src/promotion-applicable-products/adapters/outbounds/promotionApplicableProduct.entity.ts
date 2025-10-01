import { ProductEntity } from 'src/products/adapters/outbounds/product.entity';
import type {
  ProductId,
  PromotionApplicableProductCreatedAt,
  PromotionApplicableProductId,
  PromotionApplicableProductUpdatedAt,
  PromotionId,
} from 'src/promotion-applicable-products/applications/domains/promotionApplicableProduct.domain';
import { PromotionEntity } from 'src/promotions/adapters/outbounds/promotion.entity';
import type { Status } from 'src/types/utility.type';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';

export const PromotionApplicableProductTableName = 'promotion_applicable_products';

@Entity({ name: PromotionApplicableProductTableName })
export class PromotionApplicableProductEntity {
  @PrimaryColumn({
    type: 'uuid',
    name: 'uuid',
    default: 'gen_random_uuid()',
  })
  uuid: PromotionApplicableProductId;

  @Column({ type: 'uuid', name: 'promotion_id' })
  promotionId: PromotionId;

  @Column({ type: 'uuid', name: 'product_id' })
  productId: ProductId;

  // Foreign Key Relationships
  @ManyToOne(() => PromotionEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'promotion_id' })
  promotion?: PromotionEntity;

  @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product?: ProductEntity;

  @Column({ type: 'varchar', default: 'active' })
  status: Status;

  @CreateDateColumn({ name: 'created_at' })
  declare createdAt: PromotionApplicableProductCreatedAt;

  @UpdateDateColumn({ name: 'updated_at' })
  declare updatedAt: PromotionApplicableProductUpdatedAt;
}
