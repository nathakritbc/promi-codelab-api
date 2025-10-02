import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Injectable } from '@nestjs/common';
import { Builder, StrictBuilder } from 'builder-pattern';
import { EStatus, type Status } from 'src/types/utility.type';
import { paginateQueryBuilder, PaginationParams } from '../../../utils/pagination.util';
import type {
  CategoryId,
  IProductCategory,
  ProductCategoryCreatedAt,
  ProductCategoryId,
  ProductCategoryUpdatedAt,
  ProductId,
} from '../../applications/domains/productCategory.domain';
import type {
  GetAllProductCategoriesQuery,
  GetAllProductCategoriesReturnType,
} from '../../applications/ports/productCategory.repository';
import { ProductCategoryRepository } from '../../applications/ports/productCategory.repository';
import { ProductCategoryEntity } from './productCategory.entity';

@Injectable()
export class ProductCategoryTypeOrmRepository implements ProductCategoryRepository {
  constructor(private readonly productCategoryModel: TransactionHost<TransactionalAdapterTypeOrm>) {}

  async createProductCategory(productCategory: IProductCategory): Promise<IProductCategory> {
    const resultCreated = await this.productCategoryModel.tx.getRepository(ProductCategoryEntity).save(productCategory);
    return ProductCategoryTypeOrmRepository.toDomain(resultCreated as ProductCategoryEntity);
  }

  async deleteProductCategoryById({ id }: { id: ProductCategoryId }): Promise<void> {
    await this.productCategoryModel.tx.getRepository(ProductCategoryEntity).delete({ uuid: id });
  }

  async getAllProductCategories(params: GetAllProductCategoriesQuery): Promise<GetAllProductCategoriesReturnType> {
    const { sort, order, page, limit, productId, categoryId, status } = params;

    const repo = this.productCategoryModel.tx.getRepository(ProductCategoryEntity);
    const qb = repo.createQueryBuilder('productCategory');

    qb.andWhere('productCategory.status != :deleteStatus', { deleteStatus: EStatus.DELETED });

    // Apply filters
    if (productId) {
      qb.andWhere('productCategory.productId = :productId', { productId });
    }

    if (categoryId) {
      qb.andWhere('productCategory.categoryId = :categoryId', { categoryId });
    }

    if (status) {
      qb.andWhere('productCategory.status = :status', { status });
    }

    // Sorting
    const sortableColumns = ['productId', 'categoryId', 'status', 'createdAt'];
    const isValidSort = sort && sortableColumns.includes(sort);
    const sortOrder = order === 'ASC' ? 'ASC' : 'DESC';

    if (isValidSort) {
      const columnMap: Record<string, string> = {
        productId: 'product_id',
        categoryId: 'category_id',
        createdAt: 'created_at',
      };
      const dbColumn = columnMap[sort] || sort;
      qb.orderBy(`productCategory.${dbColumn}`, sortOrder);
    } else {
      qb.orderBy('productCategory.created_at', 'DESC'); // Default: newest first
    }

    const paginationParams = StrictBuilder<PaginationParams>().page(page).limit(limit).build();

    const { records: productCategories, meta } = await paginateQueryBuilder(qb, paginationParams);

    const result = productCategories.map((productCategory) =>
      ProductCategoryTypeOrmRepository.toDomain(productCategory),
    );

    return StrictBuilder<GetAllProductCategoriesReturnType>().result(result).meta(meta).build();
  }

  async getProductCategoryById({ id }: { id: ProductCategoryId }): Promise<IProductCategory | undefined> {
    const productCategory = await this.productCategoryModel.tx.getRepository(ProductCategoryEntity).findOne({
      where: { uuid: id },
    });

    if (!productCategory) return undefined;

    return ProductCategoryTypeOrmRepository.toDomain(productCategory);
  }

  async getProductCategoriesByProductId({ productId }: { productId: ProductId }): Promise<IProductCategory[]> {
    const productCategories = await this.productCategoryModel.tx.getRepository(ProductCategoryEntity).find({
      where: { productId },
      order: { createdAt: 'DESC' },
    });

    return productCategories.map((productCategory) => ProductCategoryTypeOrmRepository.toDomain(productCategory));
  }

  async getProductCategoriesByCategoryId({ categoryId }: { categoryId: CategoryId }): Promise<IProductCategory[]> {
    const productCategories = await this.productCategoryModel.tx.getRepository(ProductCategoryEntity).find({
      where: { categoryId },
      order: { createdAt: 'DESC' },
    });

    return productCategories.map((productCategory) => ProductCategoryTypeOrmRepository.toDomain(productCategory));
  }

  async getProductCategoryByAssociation({
    productId,
    categoryId,
  }: {
    productId: ProductId;
    categoryId: CategoryId;
  }): Promise<IProductCategory | undefined> {
    const productCategory = await this.productCategoryModel.tx.getRepository(ProductCategoryEntity).findOne({
      where: { productId, categoryId },
    });

    if (!productCategory) return undefined;

    return ProductCategoryTypeOrmRepository.toDomain(productCategory);
  }

  async updateProductCategoryById(productCategory: IProductCategory): Promise<IProductCategory> {
    await this.productCategoryModel.tx
      .getRepository(ProductCategoryEntity)
      .update({ uuid: productCategory.uuid }, productCategory);

    const updatedProductCategory = await this.productCategoryModel.tx.getRepository(ProductCategoryEntity).findOne({
      where: { uuid: productCategory.uuid },
    });

    return ProductCategoryTypeOrmRepository.toDomain(updatedProductCategory as ProductCategoryEntity);
  }

  public static toDomain(productCategoryEntity: ProductCategoryEntity): IProductCategory {
    return Builder<IProductCategory>()
      .uuid(productCategoryEntity.uuid as ProductCategoryId)
      .productId(productCategoryEntity.productId as ProductId)
      .categoryId(productCategoryEntity.categoryId as CategoryId)
      .status(productCategoryEntity.status as Status)
      .createdAt(productCategoryEntity.createdAt as ProductCategoryCreatedAt)
      .updatedAt(productCategoryEntity.updatedAt as ProductCategoryUpdatedAt)
      .build();
  }
}
