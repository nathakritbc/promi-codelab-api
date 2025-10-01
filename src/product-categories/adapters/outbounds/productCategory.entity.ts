import type {
  CategoryId,
  ProductCategoryCreatedAt,
  ProductCategoryId,
  ProductCategoryUpdatedAt,
  ProductId,
} from 'src/product-categories/applications/domains/productCategory.domain';
import type { Status } from 'src/types/utility.type';
import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

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

  @Column({ type: 'varchar', default: 'active' })
  status: Status;

  @CreateDateColumn({ name: 'created_at' })
  declare createdAt: ProductCategoryCreatedAt;

  @UpdateDateColumn({ name: 'updated_at' })
  declare updatedAt: ProductCategoryUpdatedAt;
}
