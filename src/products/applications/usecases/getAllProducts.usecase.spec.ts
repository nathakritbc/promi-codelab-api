import { faker } from '@faker-js/faker';
import { Builder, StrictBuilder } from 'builder-pattern';
import { GetAllMetaType } from 'src/types/utility.type';
import { vi } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { IProduct, ProductId, ProductName, ProductPrice } from '../domains/product.domain';
import { GetAllProductsQuery, GetAllProductsReturnType, ProductRepository } from '../ports/product.repository';
import { GetAllProductsUseCase } from './getAllProducts.usecase';

describe('GetAllProductsUseCase', () => {
  let useCase: GetAllProductsUseCase;
  const productRepository = mock<ProductRepository>();

  beforeEach(() => {
    useCase = new GetAllProductsUseCase(productRepository);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const productId1 = faker.string.uuid() as ProductId;
  const productId2 = faker.string.uuid() as ProductId;

  const mockProduct1 = Builder<IProduct>()
    .uuid(productId1)
    .name(faker.commerce.productName() as ProductName)
    .price(faker.number.float({ min: 1, max: 1000, fractionDigits: 2 }) as ProductPrice)
    .build();

  const mockProduct2 = Builder<IProduct>()
    .uuid(productId2)
    .name(faker.commerce.productName() as ProductName)
    .price(faker.number.float({ min: 1, max: 1000, fractionDigits: 2 }) as ProductPrice)
    .build();

  const mockMeta = StrictBuilder<GetAllMetaType>().total(2).page(1).limit(10).totalPages(1).build();

  it('should get all products successfully with basic query', async () => {
    // Arrange
    const query = StrictBuilder<GetAllProductsQuery>().page(1).limit(10).build();
    const expectedResult = StrictBuilder<GetAllProductsReturnType>().result([mockProduct1]).meta(mockMeta).build();

    productRepository.getAllProducts.mockResolvedValue(expectedResult);

    // Act
    const actual = await useCase.execute(query);

    // Assert
    expect(actual).toEqual(expectedResult);
    expect(productRepository.getAllProducts).toHaveBeenCalledWith(query);
    expect(productRepository.getAllProducts).toHaveBeenCalledTimes(1);
  });

  it('should get all products with category filter', async () => {
    // Arrange
    const query = StrictBuilder<GetAllProductsQuery>().status('active').page(1).limit(10).build();

    const expectedResult = StrictBuilder<GetAllProductsReturnType>().result([mockProduct1]).meta(mockMeta).build();

    productRepository.getAllProducts.mockResolvedValue(expectedResult);

    // Act
    const actual = await useCase.execute(query);

    // Assert
    expect(actual).toEqual(expectedResult);
    expect(productRepository.getAllProducts).toHaveBeenCalledWith(query);
    expect(productRepository.getAllProducts).toHaveBeenCalledTimes(1);
  });

  it('should get all products with date range filter', async () => {
    // Arrange
    const query = StrictBuilder<GetAllProductsQuery>().minPrice(1).maxPrice(1000).page(1).limit(10).build();

    const expectedResult: GetAllProductsReturnType = StrictBuilder<GetAllProductsReturnType>()
      .result([mockProduct1, mockProduct2])
      .meta(mockMeta)
      .build();

    productRepository.getAllProducts.mockResolvedValue(expectedResult);

    // Act
    const actual = await useCase.execute(query);

    // Assert
    expect(actual).toEqual(expectedResult);
    expect(productRepository.getAllProducts).toHaveBeenCalledWith(query);
    expect(productRepository.getAllProducts).toHaveBeenCalledTimes(1);
  });

  it('should get all products with search and sort parameters', async () => {
    // Arrange
    const query = StrictBuilder<GetAllProductsQuery>()
      .search('groceries')
      .sort('amount')
      .order('desc')
      .page(2)
      .limit(5)
      .build();

    const expectedResult: GetAllProductsReturnType = StrictBuilder<GetAllProductsReturnType>()
      .result([mockProduct1])
      .meta({ ...mockMeta, page: 2, limit: 5, total: 1, totalPages: 1 })
      .build();

    productRepository.getAllProducts.mockResolvedValue(expectedResult);

    // Act
    const actual = await useCase.execute(query);

    // Assert
    expect(actual).toEqual(expectedResult);
    expect(productRepository.getAllProducts).toHaveBeenCalledWith(query);
    expect(productRepository.getAllProducts).toHaveBeenCalledTimes(1);
  });

  it('should return empty result when no products found', async () => {
    // Arrange
    const query = StrictBuilder<GetAllProductsQuery>().page(1).limit(10).build();

    const expectedResult = StrictBuilder<GetAllProductsReturnType>()
      .result([])
      .meta({ ...mockMeta, total: 0, totalPages: 0 })
      .build();

    productRepository.getAllProducts.mockResolvedValue(expectedResult);

    // Act
    const actual = await useCase.execute(query);

    // Assert
    expect(actual).toEqual(expectedResult);
    expect(productRepository.getAllProducts).toHaveBeenCalledWith(query);
    expect(productRepository.getAllProducts).toHaveBeenCalledTimes(1);
  });

  it('should handle repository error when getting products', async () => {
    // Arrange
    const query = StrictBuilder<GetAllProductsQuery>().page(1).limit(10).build();

    const errorMessage = 'Database connection failed';
    const expectedError = new Error(errorMessage);
    productRepository.getAllProducts.mockRejectedValue(expectedError);

    // Act
    const promise = useCase.execute(query);

    // Assert
    await expect(promise).rejects.toThrow(expectedError);
    expect(productRepository.getAllProducts).toHaveBeenCalledWith(query);
    expect(productRepository.getAllProducts).toHaveBeenCalledTimes(1);
  });

  it('should handle validation error from repository', async () => {
    // Arrange
    const query = StrictBuilder<GetAllProductsQuery>().page(1).limit(10).build();

    const validationError = new Error('Invalid query parameters');
    productRepository.getAllProducts.mockRejectedValue(validationError);

    // Act
    const promise = useCase.execute(query);

    // Assert
    await expect(promise).rejects.toThrow(validationError);
    expect(productRepository.getAllProducts).toHaveBeenCalledWith(query);
    expect(productRepository.getAllProducts).toHaveBeenCalledTimes(1);
  });
});
