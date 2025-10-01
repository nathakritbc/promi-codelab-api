import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { CategoryId } from '../domains/category.domain';
import type { CategoryRepository } from '../ports/category.repository';
import { categoryRepositoryToken } from '../ports/category.repository';

@Injectable()
export class DeleteCategoryByIdUseCase {
  constructor(
    @Inject(categoryRepositoryToken)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute({ id }: { id: CategoryId }): Promise<void> {
    const categoryFound = await this.categoryRepository.getCategoryById({ id });
    if (!categoryFound) throw new NotFoundException('Category not found');
    return this.categoryRepository.deleteCategoryById({ id });
  }
}
