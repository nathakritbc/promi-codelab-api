import type {
  ProductCode,
  ProductCreatedAt,
  ProductDescription,
  ProductId,
  ProductName,
  ProductPrice,
  ProductUpdatedAt,
} from 'src/products/applications/domains/product.domain';
import type { Status } from 'src/types/utility.type';
import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

export const ProductTableName = 'products';

@Entity({ name: ProductTableName })
export class ProductEntity {
  @PrimaryColumn({
    type: 'uuid',
    name: 'uuid',
    default: 'gen_random_uuid()',
  })
  uuid: ProductId;

  @Column({ type: 'varchar', unique: true })
  code: ProductCode;

  @Column({ type: 'varchar' })
  name: ProductName;

  @Column({ type: 'text', nullable: true })
  description?: ProductDescription;

  @Column({ type: 'int' })
  price: ProductPrice;

  @Column({ type: 'varchar', default: 'active' })
  status: Status;

  @CreateDateColumn({ name: 'created_at' })
  declare createdAt: ProductCreatedAt;

  @UpdateDateColumn({ name: 'updated_at' })
  declare updatedAt: ProductUpdatedAt;
}
