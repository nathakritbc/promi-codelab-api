import { Inject, Injectable } from '@nestjs/common';
import { ICategory } from '../domains/category.domain';
import type { CategoryRepository } from '../ports/category.repository';
import { categoryRepositoryToken } from '../ports/category.repository';

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    @Inject(categoryRepositoryToken)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(category: ICategory): Promise<ICategory> {
    return this.categoryRepository.createCategory(category);
  }
}
