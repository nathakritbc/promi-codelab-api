import { faker } from '@faker-js/faker';
import { Builder, StrictBuilder } from 'builder-pattern';
import { EStatus, GetAllMetaType, Status } from 'src/types/utility.type';
import { vi } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { CategoryId, CategoryName, CategoryTreeId, ICategory } from '../domains/category.domain';
import { CategoryRepository, GetAllCategoriesQuery, GetAllCategoriesReturnType } from '../ports/category.repository';
import { GetAllCategoriesUseCase } from './getAllCategories.usecase';

describe('GetAllCategoriesUseCase', () => {
  let useCase: GetAllCategoriesUseCase;
  const categoryRepository = mock<CategoryRepository>();

  beforeEach(() => {
    useCase = new GetAllCategoriesUseCase(categoryRepository);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const categoryId1 = faker.string.uuid() as CategoryId;
  const categoryId2 = faker.string.uuid() as CategoryId;
  const treeId1 = faker.string.uuid() as CategoryTreeId;
  const treeId2 = faker.string.uuid() as CategoryTreeId;

  const mockCategory1 = Builder<ICategory>()
    .uuid(categoryId1)
    .name(faker.commerce.department() as CategoryName)
    .ancestors([])
    .treeId(treeId1)
    .status(EStatus.ACTIVE as Status)
    .build();

  const mockCategory2 = Builder<ICategory>()
    .uuid(categoryId2)
    .name(faker.commerce.department() as CategoryName)
    .ancestors([categoryId1])
    .treeId(treeId2)
    .status(EStatus.ACTIVE as Status)

    .build();

  const mockMeta = StrictBuilder<GetAllMetaType>().total(2).page(1).limit(10).totalPages(1).build();

  it('should get all categories successfully with basic query', async () => {
    // Arrange
    const query = StrictBuilder<GetAllCategoriesQuery>().page(1).limit(10).build();
    const expectedResult = StrictBuilder<GetAllCategoriesReturnType>().result([mockCategory1]).meta(mockMeta).build();

    categoryRepository.getAllCategories.mockResolvedValue(expectedResult);

    // Act
    const actual = await useCase.execute(query);

    // Assert
    expect(actual).toEqual(expectedResult);
    expect(categoryRepository.getAllCategories).toHaveBeenCalledWith(query);
    expect(categoryRepository.getAllCategories).toHaveBeenCalledTimes(1);
  });

  it('should get all categories with status filter', async () => {
    // Arrange
    const query = StrictBuilder<GetAllCategoriesQuery>()
      .status(EStatus.ACTIVE as Status)
      .page(1)
      .limit(10)
      .build();

    const expectedResult = StrictBuilder<GetAllCategoriesReturnType>().result([mockCategory1]).meta(mockMeta).build();

    categoryRepository.getAllCategories.mockResolvedValue(expectedResult);

    // Act
    const actual = await useCase.execute(query);

    // Assert
    expect(actual).toEqual(expectedResult);
    expect(categoryRepository.getAllCategories).toHaveBeenCalledWith(query);
    expect(categoryRepository.getAllCategories).toHaveBeenCalledTimes(1);
  });

  it('should get all categories with parentId filter', async () => {
    // Arrange
    const query = StrictBuilder<GetAllCategoriesQuery>().parentId(categoryId1).page(1).limit(10).build();

    const expectedResult: GetAllCategoriesReturnType = StrictBuilder<GetAllCategoriesReturnType>()
      .result([mockCategory2])
      .meta(mockMeta)
      .build();

    categoryRepository.getAllCategories.mockResolvedValue(expectedResult);

    // Act
    const actual = await useCase.execute(query);

    // Assert
    expect(actual).toEqual(expectedResult);
    expect(categoryRepository.getAllCategories).toHaveBeenCalledWith(query);
    expect(categoryRepository.getAllCategories).toHaveBeenCalledTimes(1);
  });

  it('should get all root categories with isRoot filter', async () => {
    // Arrange
    const query = StrictBuilder<GetAllCategoriesQuery>().isRoot(true).page(1).limit(10).build();

    const expectedResult: GetAllCategoriesReturnType = StrictBuilder<GetAllCategoriesReturnType>()
      .result([mockCategory1])
      .meta(mockMeta)
      .build();

    categoryRepository.getAllCategories.mockResolvedValue(expectedResult);

    // Act
    const actual = await useCase.execute(query);

    // Assert
    expect(actual).toEqual(expectedResult);
    expect(categoryRepository.getAllCategories).toHaveBeenCalledWith(query);
    expect(categoryRepository.getAllCategories).toHaveBeenCalledTimes(1);
  });

  it('should get all categories with search and sort parameters', async () => {
    // Arrange
    const query = StrictBuilder<GetAllCategoriesQuery>()
      .search('electronics')
      .sort('name')
      .order('asc')
      .page(2)
      .limit(5)
      .build();

    const expectedResult: GetAllCategoriesReturnType = StrictBuilder<GetAllCategoriesReturnType>()
      .result([mockCategory1])
      .meta({ ...mockMeta, page: 2, limit: 5, total: 1, totalPages: 1 })
      .build();

    categoryRepository.getAllCategories.mockResolvedValue(expectedResult);

    // Act
    const actual = await useCase.execute(query);

    // Assert
    expect(actual).toEqual(expectedResult);
    expect(categoryRepository.getAllCategories).toHaveBeenCalledWith(query);
    expect(categoryRepository.getAllCategories).toHaveBeenCalledTimes(1);
  });

  it('should return empty result when no categories found', async () => {
    // Arrange
    const query = StrictBuilder<GetAllCategoriesQuery>().page(1).limit(10).build();

    const expectedResult = StrictBuilder<GetAllCategoriesReturnType>()
      .result([])
      .meta({ ...mockMeta, total: 0, totalPages: 0 })
      .build();

    categoryRepository.getAllCategories.mockResolvedValue(expectedResult);

    // Act
    const actual = await useCase.execute(query);

    // Assert
    expect(actual).toEqual(expectedResult);
    expect(categoryRepository.getAllCategories).toHaveBeenCalledWith(query);
    expect(categoryRepository.getAllCategories).toHaveBeenCalledTimes(1);
  });

  it('should handle repository error when getting categories', async () => {
    // Arrange
    const query = StrictBuilder<GetAllCategoriesQuery>().page(1).limit(10).build();

    const errorMessage = 'Database connection failed';
    const expectedError = new Error(errorMessage);
    categoryRepository.getAllCategories.mockRejectedValue(expectedError);

    // Act
    const promise = useCase.execute(query);

    // Assert
    await expect(promise).rejects.toThrow(expectedError);
    expect(categoryRepository.getAllCategories).toHaveBeenCalledWith(query);
    expect(categoryRepository.getAllCategories).toHaveBeenCalledTimes(1);
  });

  it('should handle validation error from repository', async () => {
    // Arrange
    const query = StrictBuilder<GetAllCategoriesQuery>().page(1).limit(10).build();

    const validationError = new Error('Invalid query parameters');
    categoryRepository.getAllCategories.mockRejectedValue(validationError);

    // Act
    const promise = useCase.execute(query);

    // Assert
    await expect(promise).rejects.toThrow(validationError);
    expect(categoryRepository.getAllCategories).toHaveBeenCalledWith(query);
    expect(categoryRepository.getAllCategories).toHaveBeenCalledTimes(1);
  });
});
