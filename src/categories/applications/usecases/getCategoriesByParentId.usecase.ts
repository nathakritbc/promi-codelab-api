import { Inject, Injectable } from '@nestjs/common';
import type { ICategory } from '../domains/category.domain';
import type { CategoryRepository } from '../ports/category.repository';
import { categoryRepositoryToken } from '../ports/category.repository';

@Injectable()
export class GetCategoriesByParentIdUseCase {
  constructor(
    @Inject(categoryRepositoryToken)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute({ parentId }: { parentId: string }): Promise<ICategory[]> {
    return this.categoryRepository.getCategoriesByParentId({ parentId });
  }
}
