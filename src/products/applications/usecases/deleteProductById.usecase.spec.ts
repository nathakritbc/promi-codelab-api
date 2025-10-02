import { faker } from '@faker-js/faker';
import { NotFoundException } from '@nestjs/common';
import { vi } from 'vitest';
import { mock } from 'vitest-mock-extended';
import type { IProduct } from '../domains/product.domain';
import { ProductId } from '../domains/product.domain';
import { ProductRepository } from '../ports/product.repository';
import { DeleteProductByIdUseCase } from './deleteProductById.usecase';

describe('DeleteProductByIdUseCase', () => {
  let useCase: DeleteProductByIdUseCase;
  const productRepository = mock<ProductRepository>();

  beforeEach(() => {
    useCase = new DeleteProductByIdUseCase(productRepository);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const productId = faker.string.uuid() as ProductId;
  it('should be throw error when product not found', async () => {
    //Arrange
    const errorExpected = new NotFoundException('Product not found');
    productRepository.getProductById.mockResolvedValue(undefined);

    //Act
    const promise = useCase.execute({ id: productId });

    //Assert
    await expect(promise).rejects.toThrow(errorExpected);
    expect(productRepository.getProductById).toHaveBeenCalledWith({ id: productId });
    expect(productRepository.deleteProductById).not.toHaveBeenCalled();
  });

  it('should be delete product', async () => {
    //Arrange
    const mockProduct = mock<IProduct>({ uuid: productId });

    productRepository.getProductById.mockResolvedValue(mockProduct);
    productRepository.deleteProductById.mockResolvedValue(undefined);

    //Act
    const actual = await useCase.execute({ id: productId });
    //Assert
    expect(actual).toBeUndefined();
    expect(productRepository.getProductById).toHaveBeenCalledWith({ id: productId });
    expect(productRepository.deleteProductById).toHaveBeenCalledWith({ id: productId });
  });
});
