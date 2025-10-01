import { Transactional } from '@nestjs-cls/transactional';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Builder } from 'builder-pattern';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';
import type {
  DiscountType,
  IPromotion,
  PromotionDiscountValue,
  PromotionEndsAt,
  PromotionId,
  PromotionMaxDiscountAmount,
  PromotionName,
  PromotionPriority,
  PromotionStartsAt,
  PromotionStatus,
} from 'src/promotions/applications/domains/promotion.domain';
import { EDiscountType, EPromotionStatus } from 'src/promotions/applications/domains/promotion.domain';
import { CreatePromotionUseCase } from 'src/promotions/applications/usecases/createPromotion.usecase';
import { DeletePromotionByIdUseCase } from 'src/promotions/applications/usecases/deletePromotionById.usecase';
import { GetAllPromotionsUseCase } from 'src/promotions/applications/usecases/getAllPromotions.usecase';
import { GetPromotionByIdUseCase } from 'src/promotions/applications/usecases/getPromotionById.usecase';
import { UpdatePromotionByIdUseCase } from 'src/promotions/applications/usecases/updatePromotionById.usecase';
import { CreatePromotionDto } from './dto/createPromotion.dto';
import type { UpdatePromotionDto } from './dto/updatePromotion.dto';

@ApiTags('Promotions')
@UseGuards(JwtAuthGuard)
@Controller('promotions')
export class PromotionController {
  constructor(
    private readonly createPromotionUseCase: CreatePromotionUseCase,
    private readonly deletePromotionByIdUseCase: DeletePromotionByIdUseCase,
    private readonly getAllPromotionsUseCase: GetAllPromotionsUseCase,
    private readonly updatePromotionByIdUseCase: UpdatePromotionByIdUseCase,
    private readonly getPromotionByIdUseCase: GetPromotionByIdUseCase,
  ) {}

  @ApiOperation({ summary: 'Create a promotion' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'The promotion has been successfully created.' })
  @Post()
  @Transactional()
  create(@Body() createPromotionDto: CreatePromotionDto): Promise<IPromotion> {
    const command = Builder<IPromotion>()
      .name(createPromotionDto.name)
      .status((createPromotionDto.status || EPromotionStatus.DRAFT) as unknown as PromotionStatus)
      .startsAt(createPromotionDto.startsAt)
      .endsAt(createPromotionDto.endsAt)
      .discountType((createPromotionDto.discountType || EDiscountType.PERCENT) as unknown as DiscountType)
      .discountValue(createPromotionDto.discountValue)
      .maxDiscountAmount(createPromotionDto.maxDiscountAmount)
      .priority((createPromotionDto.priority || 0) as PromotionPriority)
      .build();
    return this.createPromotionUseCase.execute(command);
  }

  @ApiOperation({ summary: 'Get all promotions' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The promotions have been successfully retrieved.' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, type: String, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: EPromotionStatus })
  @ApiQuery({ name: 'discountType', required: false, enum: EDiscountType })
  @Get()
  @Transactional()
  getAll(
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('order') order?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('discountType') discountType?: string,
  ) {
    return this.getAllPromotionsUseCase.execute({ search, sort, order, page, limit, status, discountType });
  }

  @ApiOperation({ summary: 'Get a promotion by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The promotion has been successfully retrieved.' })
  @ApiParam({ name: 'id', type: String, description: 'The id of the promotion' })
  @Get(':id')
  @Transactional()
  getById(@Param('id', ParseUUIDPipe) id: PromotionId): Promise<IPromotion> {
    return this.getPromotionByIdUseCase.execute({ id });
  }

  @ApiOperation({ summary: 'Update a promotion' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The promotion has been successfully updated.' })
  @ApiParam({ name: 'id', type: String, description: 'The id of the promotion' })
  @Put(':id')
  @Transactional()
  update(
    @Param('id', ParseUUIDPipe) id: PromotionId,
    @Body() updatePromotionDto: UpdatePromotionDto,
  ): Promise<IPromotion> {
    const command = Builder<IPromotion>()
      .uuid(id)
      .name(updatePromotionDto.name as PromotionName)
      .status(updatePromotionDto.status as unknown as PromotionStatus)
      .startsAt(updatePromotionDto.startsAt as PromotionStartsAt)
      .endsAt(updatePromotionDto.endsAt as PromotionEndsAt)
      .discountType(updatePromotionDto.discountType as unknown as DiscountType)
      .discountValue(updatePromotionDto.discountValue as PromotionDiscountValue)
      .maxDiscountAmount(updatePromotionDto.maxDiscountAmount as PromotionMaxDiscountAmount)
      .priority(updatePromotionDto.priority as PromotionPriority)
      .build();
    return this.updatePromotionByIdUseCase.execute(command);
  }

  @ApiOperation({ summary: 'Delete a promotion' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The promotion has been successfully deleted.' })
  @ApiParam({ name: 'id', type: String, description: 'The id of the promotion' })
  @Delete(':id')
  @Transactional()
  delete(@Param('id', ParseUUIDPipe) id: PromotionId): Promise<void> {
    return this.deletePromotionByIdUseCase.execute({ id });
  }
}

