import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { CategoryId, ICategory } from '../domains/category.domain';
import type { CategoryRepository } from '../ports/category.repository';
import { categoryRepositoryToken } from '../ports/category.repository';

@Injectable()
export class GetCategoryByIdUseCase {
  constructor(
    @Inject(categoryRepositoryToken)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute({ id }: { id: CategoryId }): Promise<ICategory> {
    const category = await this.categoryRepository.getCategoryById({ id });
    if (!category) throw new NotFoundException('Category not found');

    return category;
  }
}
