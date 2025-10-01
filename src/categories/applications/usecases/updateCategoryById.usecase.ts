import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { type ICategory } from '../domains/category.domain';
import type { CategoryRepository } from '../ports/category.repository';
import { categoryRepositoryToken } from '../ports/category.repository';

@Injectable()
export class UpdateCategoryByIdUseCase {
  constructor(
    @Inject(categoryRepositoryToken)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(category: ICategory): Promise<ICategory> {
    const existingCategory = await this.categoryRepository.getCategoryById({ id: category.uuid });
    if (!existingCategory) throw new NotFoundException('Category not found');

    return this.categoryRepository.updateCategoryById(category);
  }
}
