import { Inject, Injectable } from '@nestjs/common';
import { Builder } from 'builder-pattern';
import { Category, ICategory } from '../domains/category.domain';
import type { CategoryRepository } from '../ports/category.repository';
import { categoryRepositoryToken } from '../ports/category.repository';

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    @Inject(categoryRepositoryToken)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(category: ICategory): Promise<ICategory> {
    const categoryInput = Builder(Category)
      .name(category.name)
      .ancestors(category.ancestors)
      .status(category.status)
      .build();
    categoryInput.createRootCategory();

    console.log('categoryInput', categoryInput);

    return this.categoryRepository.createCategory(categoryInput);
  }
}
