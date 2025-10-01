import { faker } from '@faker-js/faker';
import { NotFoundException } from '@nestjs/common';
import { Builder } from 'builder-pattern';
import { vi } from 'vitest';
import { mock } from 'vitest-mock-extended';
import {
  DiscountType,
  EDiscountType,
  EPromotionStatus,
  IPromotion,
  PromotionCreatedAt,
  PromotionDiscountValue,
  PromotionEndsAt,
  PromotionId,
  PromotionMaxDiscountAmount,
  PromotionName,
  PromotionPriority,
  PromotionStartsAt,
  PromotionStatus,
  PromotionUpdatedAt,
} from '../domains/promotion.domain';
import { PromotionRepository } from '../ports/promotion.repository';
import { DeletePromotionByIdUseCase } from './deletePromotionById.usecase';

describe('DeletePromotionByIdUseCase', () => {
  let useCase: DeletePromotionByIdUseCase;
  const promotionRepository = mock<PromotionRepository>();

  beforeEach(() => {
    useCase = new DeletePromotionByIdUseCase(promotionRepository);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const promotionId = faker.string.uuid() as PromotionId;
  const mockPromotion = Builder<IPromotion>()
    .uuid(promotionId)
    .name(faker.commerce.productName() as PromotionName)
    .status(EPromotionStatus.ACTIVE as unknown as PromotionStatus)
    .startsAt(faker.date.past() as PromotionStartsAt)
    .endsAt(faker.date.future() as PromotionEndsAt)
    .discountType(EDiscountType.PERCENT as unknown as DiscountType)
    .discountValue(faker.number.int({ min: 5, max: 50 }) as PromotionDiscountValue)
    .maxDiscountAmount(faker.number.int({ min: 50, max: 200 }) as PromotionMaxDiscountAmount)
    .priority(faker.number.int({ min: 0, max: 10 }) as PromotionPriority)
    .createdAt(new Date() as PromotionCreatedAt)
    .updatedAt(new Date() as PromotionUpdatedAt)
    .build();

  it('should delete promotion successfully', async () => {
    // Arrange
    promotionRepository.getPromotionById.mockResolvedValue(mockPromotion);
    promotionRepository.deletePromotionById.mockResolvedValue(undefined);

    // Act
    await useCase.execute({ id: promotionId });

    // Assert
    expect(promotionRepository.getPromotionById).toHaveBeenCalledWith({ id: promotionId });
    expect(promotionRepository.deletePromotionById).toHaveBeenCalledWith({ id: promotionId });
    expect(promotionRepository.getPromotionById).toHaveBeenCalledTimes(1);
    expect(promotionRepository.deletePromotionById).toHaveBeenCalledTimes(1);
  });

  it('should throw NotFoundException when promotion not found', async () => {
    // Arrange
    promotionRepository.getPromotionById.mockResolvedValue(undefined);

    // Act
    const promise = useCase.execute({ id: promotionId });

    // Assert
    await expect(promise).rejects.toThrow(NotFoundException);
    await expect(promise).rejects.toThrow('Promotion not found');
    expect(promotionRepository.getPromotionById).toHaveBeenCalledWith({ id: promotionId });
    expect(promotionRepository.deletePromotionById).not.toHaveBeenCalled();
  });

  it('should handle repository error when deleting', async () => {
    // Arrange
    const errorMessage = 'Database connection failed';
    const expectedError = new Error(errorMessage);
    promotionRepository.getPromotionById.mockResolvedValue(mockPromotion);
    promotionRepository.deletePromotionById.mockRejectedValue(expectedError);

    // Act
    const promise = useCase.execute({ id: promotionId });

    // Assert
    await expect(promise).rejects.toThrow(expectedError);
    expect(promotionRepository.getPromotionById).toHaveBeenCalledWith({ id: promotionId });
    expect(promotionRepository.deletePromotionById).toHaveBeenCalledWith({ id: promotionId });
  });

  it('should handle repository error when getting promotion', async () => {
    // Arrange
    const errorMessage = 'Database connection failed';
    const expectedError = new Error(errorMessage);
    promotionRepository.getPromotionById.mockRejectedValue(expectedError);

    // Act
    const promise = useCase.execute({ id: promotionId });

    // Assert
    await expect(promise).rejects.toThrow(expectedError);
    expect(promotionRepository.getPromotionById).toHaveBeenCalledWith({ id: promotionId });
    expect(promotionRepository.deletePromotionById).not.toHaveBeenCalled();
  });
});
