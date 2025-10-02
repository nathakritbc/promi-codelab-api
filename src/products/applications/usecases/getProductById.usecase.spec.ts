import { faker } from '@faker-js/faker';
import { NotFoundException } from '@nestjs/common';
import { vi } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { IProduct, ProductId } from '../domains/product.domain';
import { ProductRepository } from '../ports/product.repository';
import { GetProductByIdUseCase } from './getProductById.usecase';

describe('GetProductByIdUseCase', () => {
  let useCase: GetProductByIdUseCase;
  const productRepository = mock<ProductRepository>();

  beforeEach(() => {
    useCase = new GetProductByIdUseCase(productRepository);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const productId = faker.string.uuid() as ProductId;
  it('should be throw error when product not found', async () => {
    //Arrange
    productRepository.getProductById.mockResolvedValue(undefined);
    const errorExpected = new NotFoundException('Product not found');

    //Act
    const promise = useCase.execute({ id: productId });

    //Assert
    await expect(promise).rejects.toThrow(errorExpected);
    expect(productRepository.getProductById).toHaveBeenCalledWith({ id: productId });
  });

  it('should be get product by id', async () => {
    //Arrange
    const product = mock<IProduct>({ uuid: productId });
    productRepository.getProductById.mockResolvedValue(product);

    //Act
    const actual = await useCase.execute({ id: productId });
    //Assert
    expect(actual).toEqual(product);
    expect(productRepository.getProductById).toHaveBeenCalledWith({ id: productId });
  });
});
