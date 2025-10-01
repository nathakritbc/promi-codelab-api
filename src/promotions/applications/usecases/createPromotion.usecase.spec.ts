import { faker } from '@faker-js/faker';
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
import { CreatePromotionUseCase } from './createPromotion.usecase';

describe('CreatePromotionUseCase', () => {
  let useCase: CreatePromotionUseCase;
  const promotionRepository = mock<PromotionRepository>();

  beforeEach(() => {
    useCase = new CreatePromotionUseCase(promotionRepository);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const promotionId = faker.string.uuid() as PromotionId;
  const name = faker.commerce.productName() as PromotionName;
  const status = EPromotionStatus.DRAFT as unknown as PromotionStatus;
  const startsAt = faker.date.future() as PromotionStartsAt;
  const endsAt = faker.date.future() as PromotionEndsAt;
  const discountType = EDiscountType.PERCENT as unknown as DiscountType;
  const discountValue = faker.number.int({ min: 5, max: 50 }) as PromotionDiscountValue;
  const maxDiscountAmount = faker.number.int({ min: 50, max: 200 }) as PromotionMaxDiscountAmount;
  const priority = faker.number.int({ min: 0, max: 10 }) as PromotionPriority;

  const promotionData = Builder<IPromotion>()
    .uuid(promotionId)
    .name(name)
    .status(status)
    .startsAt(startsAt)
    .endsAt(endsAt)
    .discountType(discountType)
    .discountValue(discountValue)
    .maxDiscountAmount(maxDiscountAmount)
    .priority(priority)
    .createdAt(new Date() as PromotionCreatedAt)
    .updatedAt(new Date() as PromotionUpdatedAt)
    .build();

  it('should create promotion successfully', async () => {
    // Arrange
    const expectedPromotion = promotionData;

    promotionRepository.createPromotion.mockResolvedValue(expectedPromotion);

    // Act
    const actual = await useCase.execute(promotionData);

    // Assert
    expect(actual).toEqual(expectedPromotion);
    expect(promotionRepository.createPromotion).toHaveBeenCalledWith(promotionData);
    expect(promotionRepository.createPromotion).toHaveBeenCalledTimes(1);
  });

  it('should create promotion with fixed discount type successfully', async () => {
    // Arrange
    const fixedDiscountPromotion = Builder<IPromotion>()
      .uuid(promotionId)
      .name(name)
      .status(status)
      .startsAt(startsAt)
      .endsAt(endsAt)
      .discountType(EDiscountType.FIXED as unknown as DiscountType)
      .discountValue(100 as PromotionDiscountValue)
      .priority(priority)
      .createdAt(new Date() as PromotionCreatedAt)
      .updatedAt(new Date() as PromotionUpdatedAt)
      .build();

    promotionRepository.createPromotion.mockResolvedValue(fixedDiscountPromotion);

    // Act
    const actual = await useCase.execute(fixedDiscountPromotion);

    // Assert
    expect(actual).toEqual(fixedDiscountPromotion);
    expect(promotionRepository.createPromotion).toHaveBeenCalledWith(fixedDiscountPromotion);
    expect(promotionRepository.createPromotion).toHaveBeenCalledTimes(1);
  });

  it('should create promotion without optional maxDiscountAmount', async () => {
    // Arrange
    const promotionWithoutMax = Builder<IPromotion>()
      .uuid(promotionId)
      .name(name)
      .status(status)
      .startsAt(startsAt)
      .endsAt(endsAt)
      .discountType(discountType)
      .discountValue(discountValue)
      .priority(priority)
      .createdAt(new Date() as PromotionCreatedAt)
      .updatedAt(new Date() as PromotionUpdatedAt)
      .build();

    promotionRepository.createPromotion.mockResolvedValue(promotionWithoutMax);

    // Act
    const actual = await useCase.execute(promotionWithoutMax);

    // Assert
    expect(actual).toEqual(promotionWithoutMax);
    expect(promotionRepository.createPromotion).toHaveBeenCalledWith(promotionWithoutMax);
    expect(promotionRepository.createPromotion).toHaveBeenCalledTimes(1);
  });

  it('should handle repository error when creating promotion', async () => {
    // Arrange
    const errorMessage = 'Database connection failed';
    const expectedError = new Error(errorMessage);
    promotionRepository.createPromotion.mockRejectedValue(expectedError);

    // Act
    const promise = useCase.execute(promotionData);

    // Assert
    await expect(promise).rejects.toThrow(expectedError);
    expect(promotionRepository.createPromotion).toHaveBeenCalledWith(promotionData);
    expect(promotionRepository.createPromotion).toHaveBeenCalledTimes(1);
  });

  it('should handle validation error from repository', async () => {
    // Arrange
    const validationError = new Error('Invalid promotion data');
    promotionRepository.createPromotion.mockRejectedValue(validationError);

    // Act
    const promise = useCase.execute(promotionData);

    // Assert
    await expect(promise).rejects.toThrow(validationError);
    expect(promotionRepository.createPromotion).toHaveBeenCalledWith(promotionData);
    expect(promotionRepository.createPromotion).toHaveBeenCalledTimes(1);
  });
});
