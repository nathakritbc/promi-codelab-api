import { Inject, Injectable } from '@nestjs/common';
import type {
  CategoryRepository,
  GetAllCategoriesQuery,
  GetAllCategoriesReturnType,
} from '../ports/category.repository';
import { categoryRepositoryToken } from '../ports/category.repository';

@Injectable()
export class GetAllCategoriesUseCase {
  constructor(
    @Inject(categoryRepositoryToken)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(params: GetAllCategoriesQuery): Promise<GetAllCategoriesReturnType> {
    return this.categoryRepository.getAllCategories(params);
  }
}
