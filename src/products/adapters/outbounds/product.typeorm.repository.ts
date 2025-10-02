import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Injectable } from '@nestjs/common';
import { Builder, StrictBuilder } from 'builder-pattern';
import { isEmpty } from 'radash';
import { ProductCategoryTypeOrmRepository } from 'src/product-categories/adapters/outbounds/productCategory.typeorm.repository';
import type { ProductCategory } from 'src/product-categories/applications/domains/productCategory.domain';
import { EStatus, type Status } from 'src/types/utility.type';
import { Not } from 'typeorm';
import { paginateQueryBuilder, PaginationParams } from '../../../utils/pagination.util';
import type {
  IProduct,
  ProductCode,
  ProductCreatedAt,
  ProductDescription,
  ProductId,
  ProductName,
  ProductPrice,
  ProductUpdatedAt,
} from '../../applications/domains/product.domain';
import type { GetAllProductsQuery, GetAllProductsReturnType } from '../../applications/ports/product.repository';
import { ProductRepository } from '../../applications/ports/product.repository';
import { ProductEntity } from './product.entity';

@Injectable()
export class ProductTypeOrmRepository implements ProductRepository {
  constructor(private readonly productModel: TransactionHost<TransactionalAdapterTypeOrm>) {}

  async createProduct(product: IProduct): Promise<IProduct> {
    const resultCreated = await this.productModel.tx.getRepository(ProductEntity).save(product);
    return ProductTypeOrmRepository.toDomain(resultCreated as ProductEntity);
  }

  async deleteProductById({ id }: { id: ProductId }): Promise<void> {
    await this.productModel.tx.getRepository(ProductEntity).update({ uuid: id }, { status: EStatus.DELETED });
  }

  async getAllProducts(params: GetAllProductsQuery): Promise<GetAllProductsReturnType> {
    const { search, sort, order, page, limit, status, minPrice, maxPrice } = params;

    const repo = this.productModel.tx.getRepository(ProductEntity);
    const qb = repo.createQueryBuilder('product');

    qb.andWhere('product.status != :status', { status: EStatus.DELETED });

    // Apply filters
    if (search) {
      qb.andWhere('(product.name ILIKE :search OR product.code ILIKE :search OR product.description ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (status) {
      qb.andWhere('product.status = :status', { status });
    }

    if (minPrice !== undefined) {
      qb.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    // Sorting
    const sortableColumns = ['name', 'code', 'price', 'status', 'createdAt'];
    const isValidSort = sort && sortableColumns.includes(sort);
    const sortOrder = order === 'ASC' ? 'ASC' : 'DESC';

    if (isValidSort) {
      const columnMap: Record<string, string> = {
        createdAt: 'created_at',
      };
      const dbColumn = columnMap[sort] || sort;
      qb.orderBy(`product.${dbColumn}`, sortOrder);
    } else {
      qb.orderBy('product.created_at', 'DESC');
    }

    const paginationParams = StrictBuilder<PaginationParams>().page(page).limit(limit).build();

    const { records: products, meta } = await paginateQueryBuilder(qb, paginationParams);

    const result = products.map((product) => ProductTypeOrmRepository.toDomain(product));

    return StrictBuilder<GetAllProductsReturnType>().result(result).meta(meta).build();
  }

  async getProductById({ id }: { id: ProductId }): Promise<IProduct | undefined> {
    const product = await this.productModel.tx.getRepository(ProductEntity).findOne({
      where: { uuid: id, status: Not(EStatus.DELETED as Status) },
      relations: ['product_categories'],
    });

    if (!product) return undefined;

    return ProductTypeOrmRepository.toDomain(product);
  }

  async getProductByCode({ code }: { code: string }): Promise<IProduct | undefined> {
    const product = await this.productModel.tx.getRepository(ProductEntity).findOne({
      where: { code: code as ProductCode, status: Not(EStatus.DELETED as Status) },
    });

    if (!product) return undefined;

    return ProductTypeOrmRepository.toDomain(product);
  }

  async updateProductById(product: IProduct): Promise<IProduct> {
    await this.productModel.tx.getRepository(ProductEntity).update({ uuid: product.uuid }, product);

    const updatedProduct = await this.productModel.tx.getRepository(ProductEntity).findOne({
      where: { uuid: product.uuid },
    });

    return ProductTypeOrmRepository.toDomain(updatedProduct as ProductEntity);
  }

  public static toDomain(productEntity: ProductEntity): IProduct {
    const productCategories = isEmpty(productEntity.product_categories)
      ? []
      : productEntity.product_categories?.map((productCategory) =>
          ProductCategoryTypeOrmRepository.toDomain(productCategory),
        );
    return Builder<IProduct>()
      .uuid(productEntity.uuid as ProductId)
      .code(productEntity.code as ProductCode)
      .name(productEntity.name as ProductName)
      .description(productEntity.description as ProductDescription)
      .price(productEntity.price as ProductPrice)
      .status(productEntity.status as Status)
      .productCategories(productCategories as ProductCategory[])
      .createdAt(productEntity.createdAt as ProductCreatedAt)
      .updatedAt(productEntity.updatedAt as ProductUpdatedAt)
      .build();
  }
}
