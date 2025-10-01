import { faker } from '@faker-js/faker';
import { BadRequestException, NotFoundException } from '@nestjs/common';
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
import { UpdatePromotionByIdUseCase } from './updatePromotionById.usecase';

describe('UpdatePromotionByIdUseCase', () => {
  let useCase: UpdatePromotionByIdUseCase;
  const promotionRepository = mock<PromotionRepository>();

  beforeEach(() => {
    useCase = new UpdatePromotionByIdUseCase(promotionRepository);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const promotionId = faker.string.uuid() as PromotionId;
  const existingPromotion = Builder<IPromotion>()
    .uuid(promotionId)
    .name('Old Promotion' as PromotionName)
    .status(EPromotionStatus.ACTIVE as unknown as PromotionStatus)
    .startsAt(faker.date.past() as PromotionStartsAt)
    .endsAt(faker.date.future() as PromotionEndsAt)
    .discountType(EDiscountType.PERCENT as unknown as DiscountType)
    .discountValue(10 as PromotionDiscountValue)
    .maxDiscountAmount(100 as PromotionMaxDiscountAmount)
    .priority(1 as PromotionPriority)
    .createdAt(new Date() as PromotionCreatedAt)
    .updatedAt(new Date() as PromotionUpdatedAt)
    .build();

  const updatedPromotion = Builder<IPromotion>()
    .uuid(promotionId)
    .name('Updated Promotion' as PromotionName)
    .status(EPromotionStatus.ACTIVE as unknown as PromotionStatus)
    .startsAt(existingPromotion.startsAt)
    .endsAt(existingPromotion.endsAt)
    .discountType(EDiscountType.PERCENT as unknown as DiscountType)
    .discountValue(20 as PromotionDiscountValue)
    .maxDiscountAmount(200 as PromotionMaxDiscountAmount)
    .priority(2 as PromotionPriority)
    .createdAt(existingPromotion.createdAt)
    .updatedAt(new Date() as PromotionUpdatedAt)
    .build();

  it('should update promotion successfully', async () => {
    // Arrange
    promotionRepository.getPromotionById.mockResolvedValue(existingPromotion);
    promotionRepository.updatePromotionById.mockResolvedValue(updatedPromotion);

    // Act
    const actual = await useCase.execute(updatedPromotion);

    // Assert
    expect(actual).toEqual(updatedPromotion);
    expect(promotionRepository.getPromotionById).toHaveBeenCalledWith({ id: promotionId });
    expect(promotionRepository.updatePromotionById).toHaveBeenCalledWith(updatedPromotion);
    expect(promotionRepository.getPromotionById).toHaveBeenCalledTimes(1);
    expect(promotionRepository.updatePromotionById).toHaveBeenCalledTimes(1);
  });

  it('should throw NotFoundException when promotion not found', async () => {
    // Arrange
    promotionRepository.getPromotionById.mockResolvedValue(undefined);

    // Act
    const promise = useCase.execute(updatedPromotion);

    // Assert
    await expect(promise).rejects.toThrow(NotFoundException);
    await expect(promise).rejects.toThrow('Promotion not found');
    expect(promotionRepository.getPromotionById).toHaveBeenCalledWith({ id: promotionId });
    expect(promotionRepository.updatePromotionById).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when trying to update ended promotion', async () => {
    // Arrange
    const endedPromotion = Builder<IPromotion>()
      .uuid(promotionId)
      .name('Ended Promotion' as PromotionName)
      .status(EPromotionStatus.ENDED as unknown as PromotionStatus)
      .startsAt(faker.date.past() as PromotionStartsAt)
      .endsAt(faker.date.past() as PromotionEndsAt)
      .discountType(EDiscountType.PERCENT as unknown as DiscountType)
      .discountValue(10 as PromotionDiscountValue)
      .maxDiscountAmount(100 as PromotionMaxDiscountAmount)
      .priority(1 as PromotionPriority)
      .createdAt(new Date() as PromotionCreatedAt)
      .updatedAt(new Date() as PromotionUpdatedAt)
      .build();

    promotionRepository.getPromotionById.mockResolvedValue(endedPromotion);

    // Act
    const promise = useCase.execute(updatedPromotion);

    // Assert
    await expect(promise).rejects.toThrow(BadRequestException);
    await expect(promise).rejects.toThrow('Cannot modify ended promotion');
    expect(promotionRepository.getPromotionById).toHaveBeenCalledWith({ id: promotionId });
    expect(promotionRepository.updatePromotionById).not.toHaveBeenCalled();
  });

  it('should update draft promotion successfully', async () => {
    // Arrange
    const draftPromotion = Builder<IPromotion>()
      .uuid(promotionId)
      .name('Draft Promotion' as PromotionName)
      .status(EPromotionStatus.DRAFT as unknown as PromotionStatus)
      .startsAt(faker.date.future() as PromotionStartsAt)
      .endsAt(faker.date.future() as PromotionEndsAt)
      .discountType(EDiscountType.PERCENT as unknown as DiscountType)
      .discountValue(10 as PromotionDiscountValue)
      .maxDiscountAmount(100 as PromotionMaxDiscountAmount)
      .priority(1 as PromotionPriority)
      .createdAt(new Date() as PromotionCreatedAt)
      .updatedAt(new Date() as PromotionUpdatedAt)
      .build();

    promotionRepository.getPromotionById.mockResolvedValue(draftPromotion);
    promotionRepository.updatePromotionById.mockResolvedValue(updatedPromotion);

    // Act
    const actual = await useCase.execute(updatedPromotion);

    // Assert
    expect(actual).toEqual(updatedPromotion);
    expect(promotionRepository.getPromotionById).toHaveBeenCalledWith({ id: promotionId });
    expect(promotionRepository.updatePromotionById).toHaveBeenCalledWith(updatedPromotion);
  });

  it('should update paused promotion successfully', async () => {
    // Arrange
    const pausedPromotion = Builder<IPromotion>()
      .uuid(promotionId)
      .name('Paused Promotion' as PromotionName)
      .status(EPromotionStatus.PAUSED as unknown as PromotionStatus)
      .startsAt(faker.date.past() as PromotionStartsAt)
      .endsAt(faker.date.future() as PromotionEndsAt)
      .discountType(EDiscountType.PERCENT as unknown as DiscountType)
      .discountValue(10 as PromotionDiscountValue)
      .maxDiscountAmount(100 as PromotionMaxDiscountAmount)
      .priority(1 as PromotionPriority)
      .createdAt(new Date() as PromotionCreatedAt)
      .updatedAt(new Date() as PromotionUpdatedAt)
      .build();

    promotionRepository.getPromotionById.mockResolvedValue(pausedPromotion);
    promotionRepository.updatePromotionById.mockResolvedValue(updatedPromotion);

    // Act
    const actual = await useCase.execute(updatedPromotion);

    // Assert
    expect(actual).toEqual(updatedPromotion);
    expect(promotionRepository.getPromotionById).toHaveBeenCalledWith({ id: promotionId });
    expect(promotionRepository.updatePromotionById).toHaveBeenCalledWith(updatedPromotion);
  });

  it('should handle repository error', async () => {
    // Arrange
    const errorMessage = 'Database connection failed';
    const expectedError = new Error(errorMessage);
    promotionRepository.getPromotionById.mockResolvedValue(existingPromotion);
    promotionRepository.updatePromotionById.mockRejectedValue(expectedError);

    // Act
    const promise = useCase.execute(updatedPromotion);

    // Assert
    await expect(promise).rejects.toThrow(expectedError);
    expect(promotionRepository.getPromotionById).toHaveBeenCalledWith({ id: promotionId });
    expect(promotionRepository.updatePromotionById).toHaveBeenCalledWith(updatedPromotion);
  });
});

