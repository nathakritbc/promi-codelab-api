import { faker } from '@faker-js/faker';
import { Builder } from 'builder-pattern';
import { EStatus, Status } from 'src/types/utility.type';
import { vi } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { CategoryId, CategoryName, CategoryParentId, CategoryTreeId, ICategory } from '../domains/category.domain';
import { CategoryRepository } from '../ports/category.repository';
import { CreateCategoryUseCase } from './createCategory.usecase';

describe('CreateCategoryUseCase', () => {
  let useCase: CreateCategoryUseCase;
  const categoryRepository = mock<CategoryRepository>();

  beforeEach(() => {
    useCase = new CreateCategoryUseCase(categoryRepository);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const categoryId = faker.string.uuid() as CategoryId;
  const name = faker.commerce.department() as CategoryName;
  const parentId = faker.string.uuid() as CategoryParentId;
  const treeId = faker.string.uuid() as CategoryTreeId;

  const categoryData = Builder<ICategory>()
    .uuid(categoryId)
    .name(name)
    .ancestors([parentId])
    .treeId(treeId)
    .parentId(parentId)
    .status(EStatus.ACTIVE as Status)
    .build();

  it('should create category successfully', async () => {
    // Arrange
    const expectedCategory = categoryData;

    categoryRepository.createCategory.mockResolvedValue(expectedCategory);

    // Act
    const actual = await useCase.execute(categoryData);

    // Assert
    expect(actual).toEqual(expectedCategory);
    expect(categoryRepository.createCategory).toHaveBeenCalledTimes(1);
  });

  it('should create category with all required fields', async () => {
    // Arrange
    const fullCategoryData = Builder<ICategory>()
      .name(name)
      .ancestors([parentId])
      .treeId(treeId)
      .parentId(parentId)
      .status(EStatus.ACTIVE as Status)
      .build();

    const expectedCategory = categoryData;
    categoryRepository.createCategory.mockResolvedValue(expectedCategory);

    // Act
    const actual = await useCase.execute(fullCategoryData);

    // Assert
    expect(actual).toEqual(expectedCategory);
    expect(categoryRepository.createCategory).toHaveBeenCalledTimes(1);
  });

  it('should create category with inactive status', async () => {
    // Arrange
    const inactiveCategoryData = Builder<ICategory>()
      .name(name)
      .ancestors([parentId])
      .treeId(treeId)
      .parentId(parentId)
      .status(EStatus.INACTIVE as Status)
      .build();

    const expectedCategory = { ...categoryData, status: EStatus.INACTIVE as Status };
    categoryRepository.createCategory.mockResolvedValue(expectedCategory);

    // Act
    const actual = await useCase.execute(inactiveCategoryData);

    // Assert
    expect(actual).toEqual(expectedCategory);
    expect(categoryRepository.createCategory).toHaveBeenCalledTimes(1);
  });

  it('should create category with multiple ancestors', async () => {
    // Arrange
    const parentId2 = faker.string.uuid() as CategoryParentId;
    const categoryWithMultipleAncestors = Builder<ICategory>()
      .name(name)
      .ancestors([parentId, parentId2])
      .treeId(treeId)
      .parentId(parentId2)
      .status(EStatus.ACTIVE as Status)
      .build();

    const expectedCategory = { ...categoryData, ancestors: [parentId, parentId2], parentId: parentId2 };
    categoryRepository.createCategory.mockResolvedValue(expectedCategory);

    // Act
    const actual = await useCase.execute(categoryWithMultipleAncestors);

    // Assert
    expect(actual).toEqual(expectedCategory);
    expect(categoryRepository.createCategory).toHaveBeenCalledTimes(1);
  });

  it('should handle repository error when creating category', async () => {
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
    const duplicateError = new Error('Category name already exists in this parent');
    categoryRepository.createCategory.mockRejectedValue(duplicateError);

    // Act
    const promise = useCase.execute(categoryData);

    // Assert
    await expect(promise).rejects.toThrow(duplicateError);
    expect(categoryRepository.createCategory).toHaveBeenCalledTimes(1);
  });

  it('should handle parent category not found error', async () => {
    // Arrange
    const parentNotFoundError = new Error('Parent category does not exist');
    categoryRepository.createCategory.mockRejectedValue(parentNotFoundError);

    // Act
    const promise = useCase.execute(categoryData);

    // Assert
    await expect(promise).rejects.toThrow(parentNotFoundError);
    expect(categoryRepository.createCategory).toHaveBeenCalledTimes(1);
  });

  it('should handle business rule validation error', async () => {
    // Arrange
    const businessRuleError = new Error('Cannot create category with invalid hierarchy');
    categoryRepository.createCategory.mockRejectedValue(businessRuleError);

    // Act
    const promise = useCase.execute(categoryData);

    // Assert
    await expect(promise).rejects.toThrow(businessRuleError);
    expect(categoryRepository.createCategory).toHaveBeenCalledTimes(1);
  });
});
