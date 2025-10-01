import { StrictBuilder } from 'builder-pattern';
import type { ObjectLiteral } from 'typeorm';
import { SelectQueryBuilder } from 'typeorm';

import { GetAllMetaType } from '../types/utility.type';

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationOptions {
  defaultLimit?: number;
  allowAll?: boolean;
}

export interface PaginatedQueryResult<T> {
  records: T[];
  count: number;
  meta: GetAllMetaType;
}

export async function paginateQueryBuilder<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  params: PaginationParams,
  options?: PaginationOptions,
): Promise<PaginatedQueryResult<T>> {
  const defaultLimit = options?.defaultLimit ?? 10;
  const allowAll = options?.allowAll ?? true;

  const currentPage = params.page && params.page > 0 ? params.page : 1;
  const requestedLimit = params.limit ?? defaultLimit;
  const useAll = allowAll && requestedLimit === -1;
  const currentLimit = useAll ? -1 : requestedLimit;

  if (currentLimit !== -1) {
    qb.skip((currentPage - 1) * currentLimit).take(currentLimit);
  }

  const [records, count] = await qb.getManyAndCount();

  const totalPages = currentLimit === -1 ? 1 : currentLimit === 0 ? 0 : Math.ceil(count / currentLimit);
  const meta = StrictBuilder<GetAllMetaType>()
    .page(currentPage)
    .limit(currentLimit)
    .total(count)
    .totalPages(totalPages)
    .build();

  return StrictBuilder<PaginatedQueryResult<T>>().records(records).count(count).meta(meta).build();
}
