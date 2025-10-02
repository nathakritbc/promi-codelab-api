import { faker } from '@faker-js/faker';
import { Builder } from 'builder-pattern';
import { vi } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { IProduct, ProductCode, ProductId, ProductName, ProductUpdatedAt } from '../domains/product.domain';
import { ProductRepository } from '../ports/product.repository';
import { CreateProductUseCase } from './createProduct.usecase';

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;
  const productRepository = mock<ProductRepository>();

  beforeEach(() => {
    useCase = new CreateProductUseCase(productRepository);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const productId = faker.string.uuid() as ProductId;
  const code = faker.string.uuid() as ProductCode;
  const name = faker.string.uuid() as ProductName;

  const productData = Builder<IProduct>()
    .uuid(productId)
    .code(code)
    .name(name)
    .updatedAt(new Date() as ProductUpdatedAt)
    .build();

  it('should create product successfully', async () => {
    // Arrange
    const expectedProduct = productData;

    productRepository.createProduct.mockResolvedValue(expectedProduct);

    // Act
    const actual = await useCase.execute(productData);

    // Assert
    expect(actual).toEqual(expectedProduct);
    expect(productRepository.createProduct).toHaveBeenCalledWith(productData);
    expect(productRepository.createProduct).toHaveBeenCalledTimes(1);
  });

  it('should create product without optional fields successfully', async () => {
    // Arrange
    const expectedProduct = productData;
    productRepository.createProduct.mockResolvedValue(expectedProduct);

    // Act
    const actual = await useCase.execute(productData);

    // Assert
    expect(actual).toEqual(expectedProduct);
    expect(productRepository.createProduct).toHaveBeenCalledWith(productData);
    expect(productRepository.createProduct).toHaveBeenCalledTimes(1);
  });

  it('should handle repository error when creating product', async () => {
    // Arrange
    const errorMessage = 'Database connection failed';
    const expectedError = new Error(errorMessage);
    productRepository.createProduct.mockRejectedValue(expectedError);

    // Act
    const promise = useCase.execute(productData);

    // Assert
    await expect(promise).rejects.toThrow(expectedError);
    expect(productRepository.createProduct).toHaveBeenCalledWith(productData);
    expect(productRepository.createProduct).toHaveBeenCalledTimes(1);
  });

  it('should handle validation error from repository', async () => {
    // Arrange
    const validationError = new Error('Invalid product data');
    productRepository.createProduct.mockRejectedValue(validationError);

    // Act
    const promise = useCase.execute(productData);

    // Assert
    await expect(promise).rejects.toThrow(validationError);
    expect(productRepository.createProduct).toHaveBeenCalledWith(productData);
    expect(productRepository.createProduct).toHaveBeenCalledTimes(1);
  });
});
