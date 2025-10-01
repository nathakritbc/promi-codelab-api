import { CategoryEntity } from 'src/categories/adapters/outbounds/category.entity';
import type {
  CategoryId,
  ProductCategoryCreatedAt,
  ProductCategoryId,
  ProductCategoryUpdatedAt,
  ProductId,
} from 'src/product-categories/applications/domains/productCategory.domain';
import { ProductEntity } from 'src/products/adapters/outbounds/product.entity';
import type { Status } from 'src/types/utility.type';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';

export const ProductCategoryTableName = 'product_categories';

@Entity({ name: ProductCategoryTableName })
export class ProductCategoryEntity {
  @PrimaryColumn({
    type: 'uuid',
    name: 'uuid',
    default: 'gen_random_uuid()',
  })
  uuid: ProductCategoryId;

  @Column({ type: 'uuid', name: 'product_id' })
  productId: ProductId;

  @Column({ type: 'uuid', name: 'category_id' })
  categoryId: CategoryId;

  // Foreign Key Relationships
  @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product?: ProductEntity;

  @ManyToOne(() => CategoryEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category?: CategoryEntity;

  @Column({ type: 'varchar', default: 'active' })
  status: Status;

  @CreateDateColumn({ name: 'created_at' })
  declare createdAt: ProductCategoryCreatedAt;

  @UpdateDateColumn({ name: 'updated_at' })
  declare updatedAt: ProductCategoryUpdatedAt;
}
