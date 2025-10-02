import { faker } from '@faker-js/faker';
import { NotFoundException } from '@nestjs/common';
import { Builder } from 'builder-pattern';
import { vi } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { IProduct, ProductId } from '../domains/product.domain';
import { ProductRepository } from '../ports/product.repository';
import { UpdateProductByIdUseCase } from './updateProductById.usecase';

describe('UpdateProductByIdUseCase', () => {
  let useCase: UpdateProductByIdUseCase;
  const productRepository = mock<ProductRepository>();

  beforeEach(() => {
    useCase = new UpdateProductByIdUseCase(productRepository);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const productId = faker.string.uuid() as ProductId;
  it('should be throw error when product not found', async () => {
    //Arrange
    const command = mock<IProduct>({ uuid: productId });
    const errorExpected = new NotFoundException('Product not found');
    productRepository.getProductById.mockResolvedValue(undefined);

    //Act
    const promise = useCase.execute(command);

    //Assert
    await expect(promise).rejects.toThrow(errorExpected);
    expect(productRepository.getProductById).toHaveBeenCalledWith({ id: productId });
    expect(productRepository.updateProductById).not.toHaveBeenCalled();
  });

  it('should be update product', async () => {
    //Arrange
    const product = mock<IProduct>({ uuid: productId });
    const command = Builder<IProduct>().uuid(productId).build();
    productRepository.getProductById.mockResolvedValue(product);
    productRepository.updateProductById.mockResolvedValue(product);

    //Act
    const actual = await useCase.execute(command);

    //Assert
    expect(actual).toEqual(product);
    expect(productRepository.getProductById).toHaveBeenCalledWith({ id: productId });
    expect(productRepository.updateProductById).toHaveBeenCalledWith(command);
  });
});
