import { faker } from '@faker-js/faker';
import { Builder, StrictBuilder } from 'builder-pattern';
import { GetAllMetaType } from 'src/types/utility.type';
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
import { GetAllPromotionsQuery, GetAllPromotionsReturnType, PromotionRepository } from '../ports/promotion.repository';
import { GetAllPromotionsUseCase } from './getAllPromotions.usecase';

describe('GetAllPromotionsUseCase', () => {
  let useCase: GetAllPromotionsUseCase;
  const promotionRepository = mock<PromotionRepository>();

  beforeEach(() => {
    useCase = new GetAllPromotionsUseCase(promotionRepository);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const createMockPromotion = (): IPromotion => {
    return Builder<IPromotion>()
      .uuid(faker.string.uuid() as PromotionId)
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
  };

  it('should get all promotions successfully', async () => {
    // Arrange
    const mockPromotions = [createMockPromotion(), createMockPromotion(), createMockPromotion()];
    const mockMeta = StrictBuilder<GetAllMetaType>().total(3).page(1).limit(10).totalPages(1).build();

    const expectedResult = StrictBuilder<GetAllPromotionsReturnType>().result(mockPromotions).meta(mockMeta).build();

    const params = StrictBuilder<GetAllPromotionsQuery>().page(1).limit(10).build();

    promotionRepository.getAllPromotions.mockResolvedValue(expectedResult);

    // Act
    const actual = await useCase.execute(params);

    // Assert
    expect(actual).toEqual(expectedResult);
    expect(actual.result).toHaveLength(3);
    expect(actual.meta.total).toBe(3);
    expect(promotionRepository.getAllPromotions).toHaveBeenCalledWith(params);
    expect(promotionRepository.getAllPromotions).toHaveBeenCalledTimes(1);
  });

  it('should get promotions with search query', async () => {
    // Arrange
    const searchTerm = 'Summer Sale';
    const mockPromotions = [createMockPromotion()];
    const mockMeta = StrictBuilder<GetAllMetaType>().total(1).page(1).limit(10).totalPages(1).build();

    const expectedResult = StrictBuilder<GetAllPromotionsReturnType>().result(mockPromotions).meta(mockMeta).build();

    const params = StrictBuilder<GetAllPromotionsQuery>().search(searchTerm).page(1).limit(10).build();

    promotionRepository.getAllPromotions.mockResolvedValue(expectedResult);

    // Act
    const actual = await useCase.execute(params);

    // Assert
    expect(actual).toEqual(expectedResult);
    expect(actual.result).toHaveLength(1);
    expect(promotionRepository.getAllPromotions).toHaveBeenCalledWith(params);
    expect(promotionRepository.getAllPromotions).toHaveBeenCalledTimes(1);
  });

  it('should get promotions with status filter', async () => {
    // Arrange
    const mockPromotions = [createMockPromotion(), createMockPromotion()];
    const mockMeta = StrictBuilder<GetAllMetaType>().total(2).page(1).limit(10).totalPages(1).build();

    const expectedResult = StrictBuilder<GetAllPromotionsReturnType>().result(mockPromotions).meta(mockMeta).build();

    const params = StrictBuilder<GetAllPromotionsQuery>().status(EPromotionStatus.ACTIVE).page(1).limit(10).build();

    promotionRepository.getAllPromotions.mockResolvedValue(expectedResult);

    // Act
    const actual = await useCase.execute(params);

    // Assert
    expect(actual).toEqual(expectedResult);
    expect(actual.result).toHaveLength(2);
    expect(promotionRepository.getAllPromotions).toHaveBeenCalledWith(params);
    expect(promotionRepository.getAllPromotions).toHaveBeenCalledTimes(1);
  });

  it('should get promotions with discount type filter', async () => {
    // Arrange
    const mockPromotions = [createMockPromotion()];
    const mockMeta = StrictBuilder<GetAllMetaType>().total(1).page(1).limit(10).totalPages(1).build();

    const expectedResult = StrictBuilder<GetAllPromotionsReturnType>().result(mockPromotions).meta(mockMeta).build();

    const params = StrictBuilder<GetAllPromotionsQuery>().discountType(EDiscountType.PERCENT).page(1).limit(10).build();

    promotionRepository.getAllPromotions.mockResolvedValue(expectedResult);

    // Act
    const actual = await useCase.execute(params);

    // Assert
    expect(actual).toEqual(expectedResult);
    expect(actual.result).toHaveLength(1);
    expect(promotionRepository.getAllPromotions).toHaveBeenCalledWith(params);
    expect(promotionRepository.getAllPromotions).toHaveBeenCalledTimes(1);
  });

  it('should get promotions with sorting', async () => {
    // Arrange
    const mockPromotions = [createMockPromotion(), createMockPromotion()];
    const mockMeta = StrictBuilder<GetAllMetaType>().total(2).page(1).limit(10).totalPages(1).build();

    const expectedResult = StrictBuilder<GetAllPromotionsReturnType>().result(mockPromotions).meta(mockMeta).build();

    const params = StrictBuilder<GetAllPromotionsQuery>().sort('priority').order('DESC').page(1).limit(10).build();

    promotionRepository.getAllPromotions.mockResolvedValue(expectedResult);

    // Act
    const actual = await useCase.execute(params);

    // Assert
    expect(actual).toEqual(expectedResult);
    expect(promotionRepository.getAllPromotions).toHaveBeenCalledWith(params);
    expect(promotionRepository.getAllPromotions).toHaveBeenCalledTimes(1);
  });

  it('should return empty array when no promotions found', async () => {
    // Arrange
    const mockMeta = StrictBuilder<GetAllMetaType>().total(0).page(1).limit(10).totalPages(0).build();

    const expectedResult = StrictBuilder<GetAllPromotionsReturnType>().result([]).meta(mockMeta).build();

    const params = StrictBuilder<GetAllPromotionsQuery>().page(1).limit(10).build();

    promotionRepository.getAllPromotions.mockResolvedValue(expectedResult);

    // Act
    const actual = await useCase.execute(params);

    // Assert
    expect(actual.result).toHaveLength(0);
    expect(actual.meta.total).toBe(0);
    expect(promotionRepository.getAllPromotions).toHaveBeenCalledWith(params);
    expect(promotionRepository.getAllPromotions).toHaveBeenCalledTimes(1);
  });

  it('should handle repository error', async () => {
    // Arrange
    const errorMessage = 'Database connection failed';
    const expectedError = new Error(errorMessage);
    const params = StrictBuilder<GetAllPromotionsQuery>().page(1).limit(10).build();

    promotionRepository.getAllPromotions.mockRejectedValue(expectedError);

    // Act
    const promise = useCase.execute(params);

    // Assert
    await expect(promise).rejects.toThrow(expectedError);
    expect(promotionRepository.getAllPromotions).toHaveBeenCalledWith(params);
    expect(promotionRepository.getAllPromotions).toHaveBeenCalledTimes(1);
  });
});

