import { faker } from '@faker-js/faker';
import { Builder } from 'builder-pattern';
import { EStatus, Status } from 'src/types/utility.type';
import { vi } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { CategoryId, CategoryName, CategoryTreeId, ICategory } from '../domains/category.domain';
import { CategoryRepository } from '../ports/category.repository';
import { CreateRootCategoryUseCase } from './createRootCategory.usecase';

describe('CreateRootCategoryUseCase', () => {
  let useCase: CreateRootCategoryUseCase;
  const categoryRepository = mock<CategoryRepository>();

  beforeEach(() => {
    useCase = new CreateRootCategoryUseCase(categoryRepository);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const categoryId = faker.string.uuid() as CategoryId;
  const name = faker.commerce.department() as CategoryName;
  const treeId = faker.string.uuid() as CategoryTreeId;

  const categoryData = Builder<ICategory>()
    .uuid(categoryId)
    .name(name)
    .ancestors([])
    .treeId(treeId)
    .status(EStatus.ACTIVE as Status)
    .build();

  it('should create root category successfully', async () => {
    // Arrange
    const expectedCategory = categoryData;

    categoryRepository.createCategory.mockResolvedValue(expectedCategory);

    // Act
    const actual = await useCase.execute(categoryData);

    // Assert
    expect(actual).toEqual(expectedCategory);
    expect(categoryRepository.createCategory).toHaveBeenCalledTimes(1);
  });

  it('should create root category with minimal required fields', async () => {
    // Arrange
    const minimalCategoryData = Builder<ICategory>()
      .name(name)
      .ancestors([])
      .treeId(treeId)
      .status(EStatus.ACTIVE as Status)
      .build();

    const expectedCategory = categoryData;
    categoryRepository.createCategory.mockResolvedValue(expectedCategory);

    // Act
    const actual = await useCase.execute(minimalCategoryData);

    // Assert
    expect(actual).toEqual(expectedCategory);
    expect(categoryRepository.createCategory).toHaveBeenCalledTimes(1);
  });

  it('should handle repository error when creating root category', async () => {
    // Arrange
    const errorMessage = 'Database connection failed';
    const expectedError = new Error(errorMessage);
    categoryRepository.createCategory.mockRejectedValue(expectedError);

    // Act
    const promise = useCase.execute(categoryData);

    // Assert
    await expect(promise).rejects.toThrow(expectedError);
    expect(categoryRepository.createCategory).toHaveBeenCalledTimes(1);
  });

  it('should handle validation error from repository', async () => {
    // Arrange
    const validationError = new Error('Invalid category data');
    categoryRepository.createCategory.mockRejectedValue(validationError);

    // Act
    const promise = useCase.execute(categoryData);

    // Assert
    await expect(promise).rejects.toThrow(validationError);
    expect(categoryRepository.createCategory).toHaveBeenCalledTimes(1);
  });

  it('should handle duplicate category name error', async () => {
    // Arrange
    const duplicateError = new Error('Category name already exists');
    categoryRepository.createCategory.mockRejectedValue(duplicateError);

    // Act
    const promise = useCase.execute(categoryData);

    // Assert
    await expect(promise).rejects.toThrow(duplicateError);
    expect(categoryRepository.createCategory).toHaveBeenCalledTimes(1);
  });

  it('should handle business rule validation error', async () => {
    // Arrange
    const businessRuleError = new Error('Cannot create root category with parent');
    categoryRepository.createCategory.mockRejectedValue(businessRuleError);

    // Act
    const promise = useCase.execute(categoryData);

    // Assert
    await expect(promise).rejects.toThrow(businessRuleError);
    expect(categoryRepository.createCategory).toHaveBeenCalledTimes(1);
  });
});
