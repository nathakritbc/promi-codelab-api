import type {
  CategoryCreatedAt,
  CategoryId,
  CategoryLft,
  CategoryName,
  CategoryParentId,
  CategoryRgt,
  CategoryUpdatedAt,
} from 'src/categories/applications/domains/category.domain';
import type { Status } from 'src/types/utility.type';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export const CategoryTableName = 'categories';

@Entity({ name: CategoryTableName })
export class CategoryEntity {
  @PrimaryColumn({
    type: 'uuid',
    name: 'uuid',
    default: 'gen_random_uuid()',
  })
  uuid: CategoryId;

  @Column({ type: 'varchar', length: 255 })
  name: CategoryName;

  @Column({ type: 'uuid', nullable: true, name: 'parent_id' })
  parentId?: CategoryParentId;

  // Self-referencing Foreign Key Relationships
  @ManyToOne(() => CategoryEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parent?: CategoryEntity;

  @OneToMany(() => CategoryEntity, (category) => category.parent)
  children?: CategoryEntity[];

  @Column({ type: 'int' })
  lft: CategoryLft;

  @Column({ type: 'int' })
  rgt: CategoryRgt;

  @Column({ type: 'varchar', default: 'active' })
  status: Status;

  @CreateDateColumn({ name: 'created_at' })
  declare createdAt: CategoryCreatedAt;

  @UpdateDateColumn({ name: 'updated_at' })
  declare updatedAt: CategoryUpdatedAt;
}
