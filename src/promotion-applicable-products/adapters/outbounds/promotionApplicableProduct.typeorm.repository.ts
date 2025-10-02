import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Injectable } from '@nestjs/common';
import { Builder, StrictBuilder } from 'builder-pattern';
import { EStatus, type Status } from 'src/types/utility.type';
import { paginateQueryBuilder, PaginationParams } from '../../../utils/pagination.util';
import type {
  IPromotionApplicableProduct,
  ProductId,
  PromotionApplicableProductCreatedAt,
  PromotionApplicableProductId,
  PromotionApplicableProductUpdatedAt,
  PromotionId,
} from '../../applications/domains/promotionApplicableProduct.domain';
import type {
  GetAllPromotionApplicableProductsQuery,
  GetAllPromotionApplicableProductsReturnType,
} from '../../applications/ports/promotionApplicableProduct.repository';
import { PromotionApplicableProductRepository } from '../../applications/ports/promotionApplicableProduct.repository';
import { PromotionApplicableProductEntity } from './promotionApplicableProduct.entity';

@Injectable()
export class PromotionApplicableProductTypeOrmRepository implements PromotionApplicableProductRepository {
  constructor(private readonly promotionApplicableProductModel: TransactionHost<TransactionalAdapterTypeOrm>) {}

  async createPromotionApplicableProduct(
    promotionApplicableProduct: IPromotionApplicableProduct,
  ): Promise<IPromotionApplicableProduct> {
    const resultCreated = await this.promotionApplicableProductModel.tx
      .getRepository(PromotionApplicableProductEntity)
      .save(promotionApplicableProduct);
    return PromotionApplicableProductTypeOrmRepository.toDomain(resultCreated as PromotionApplicableProductEntity);
  }

  async deletePromotionApplicableProductById({ id }: { id: PromotionApplicableProductId }): Promise<void> {
    await this.promotionApplicableProductModel.tx.getRepository(PromotionApplicableProductEntity).delete({ uuid: id });
  }

  async getAllPromotionApplicableProducts(
    params: GetAllPromotionApplicableProductsQuery,
  ): Promise<GetAllPromotionApplicableProductsReturnType> {
    const { search, sort, order, page, limit, promotionId, productId, status } = params;

    const repo = this.promotionApplicableProductModel.tx.getRepository(PromotionApplicableProductEntity);
    const qb = repo.createQueryBuilder('promotionApplicableProduct');

    qb.andWhere('promotionApplicableProduct.status != :deleteStatus', { deleteStatus: EStatus.DELETED });

    // Apply filters
    if (search) {
      qb.andWhere(
        '(promotionApplicableProduct.productId ILIKE :search OR promotionApplicableProduct.promotionId ILIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    // Apply filters
    if (promotionId) {
      qb.andWhere('promotionApplicableProduct.promotionId = :promotionId', { promotionId });
    }

    if (productId) {
      qb.andWhere('promotionApplicableProduct.productId = :productId', { productId });
    }

    if (status) {
      qb.andWhere('promotionApplicableProduct.status = :status', { status });
    }

    // Sorting
    const sortableColumns = ['promotionId', 'productId', 'status', 'createdAt'];
    const isValidSort = sort && sortableColumns.includes(sort);
    const sortOrder = order === 'ASC' ? 'ASC' : 'DESC';

    if (isValidSort) {
      const columnMap: Record<string, string> = {
        promotionId: 'promotion_id',
        productId: 'product_id',
        createdAt: 'created_at',
      };
      const dbColumn = columnMap[sort] || sort;
      qb.orderBy(`promotionApplicableProduct.${dbColumn}`, sortOrder);
    } else {
      qb.orderBy('promotionApplicableProduct.created_at', 'DESC'); // Default: newest first
    }

    const paginationParams = StrictBuilder<PaginationParams>().page(page).limit(limit).build();

    const { records: promotionApplicableProducts, meta } = await paginateQueryBuilder(qb, paginationParams);

    const result = promotionApplicableProducts.map((promotionApplicableProduct) =>
      PromotionApplicableProductTypeOrmRepository.toDomain(promotionApplicableProduct),
    );

    return StrictBuilder<GetAllPromotionApplicableProductsReturnType>().result(result).meta(meta).build();
  }

  async getPromotionApplicableProductById({
    id,
  }: {
    id: PromotionApplicableProductId;
  }): Promise<IPromotionApplicableProduct | undefined> {
    const promotionApplicableProduct = await this.promotionApplicableProductModel.tx
      .getRepository(PromotionApplicableProductEntity)
      .findOne({
        where: { uuid: id },
      });

    if (!promotionApplicableProduct) return undefined;

    return PromotionApplicableProductTypeOrmRepository.toDomain(promotionApplicableProduct);
  }

  async getPromotionApplicableProductsByPromotionId({
    promotionId,
  }: {
    promotionId: PromotionId;
  }): Promise<IPromotionApplicableProduct[]> {
    const promotionApplicableProducts = await this.promotionApplicableProductModel.tx
      .getRepository(PromotionApplicableProductEntity)
      .find({
        where: { promotionId },
        order: { createdAt: 'DESC' },
      });

    return promotionApplicableProducts.map((promotionApplicableProduct) =>
      PromotionApplicableProductTypeOrmRepository.toDomain(promotionApplicableProduct),
    );
  }

  async getPromotionApplicableProductsByProductId({
    productId,
  }: {
    productId: ProductId;
  }): Promise<IPromotionApplicableProduct[]> {
    const promotionApplicableProducts = await this.promotionApplicableProductModel.tx
      .getRepository(PromotionApplicableProductEntity)
      .find({
        where: { productId },
        order: { createdAt: 'DESC' },
      });

    return promotionApplicableProducts.map((promotionApplicableProduct) =>
      PromotionApplicableProductTypeOrmRepository.toDomain(promotionApplicableProduct),
    );
  }

  async getPromotionApplicableProductByAssociation({
    promotionId,
    productId,
  }: {
    promotionId: PromotionId;
    productId: ProductId;
  }): Promise<IPromotionApplicableProduct | undefined> {
    const promotionApplicableProduct = await this.promotionApplicableProductModel.tx
      .getRepository(PromotionApplicableProductEntity)
      .findOne({
        where: { promotionId, productId },
      });

    if (!promotionApplicableProduct) return undefined;

    return PromotionApplicableProductTypeOrmRepository.toDomain(promotionApplicableProduct);
  }

  async updatePromotionApplicableProductById(
    promotionApplicableProduct: IPromotionApplicableProduct,
  ): Promise<IPromotionApplicableProduct> {
    await this.promotionApplicableProductModel.tx
      .getRepository(PromotionApplicableProductEntity)
      .update({ uuid: promotionApplicableProduct.uuid }, promotionApplicableProduct);

    const updatedPromotionApplicableProduct = await this.promotionApplicableProductModel.tx
      .getRepository(PromotionApplicableProductEntity)
      .findOne({
        where: { uuid: promotionApplicableProduct.uuid },
      });

    return PromotionApplicableProductTypeOrmRepository.toDomain(
      updatedPromotionApplicableProduct as PromotionApplicableProductEntity,
    );
  }

  public static toDomain(
    promotionApplicableProductEntity: PromotionApplicableProductEntity,
  ): IPromotionApplicableProduct {
    return Builder<IPromotionApplicableProduct>()
      .uuid(promotionApplicableProductEntity.uuid as PromotionApplicableProductId)
      .promotionId(promotionApplicableProductEntity.promotionId as PromotionId)
      .productId(promotionApplicableProductEntity.productId as ProductId)
      .status(promotionApplicableProductEntity.status as Status)
      .createdAt(promotionApplicableProductEntity.createdAt as PromotionApplicableProductCreatedAt)
      .updatedAt(promotionApplicableProductEntity.updatedAt as PromotionApplicableProductUpdatedAt)
      .build();
  }
}
