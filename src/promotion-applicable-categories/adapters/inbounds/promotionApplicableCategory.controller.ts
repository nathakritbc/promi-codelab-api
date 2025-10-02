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
import { Builder, StrictBuilder } from 'builder-pattern';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';
import type {
  CategoryId,
  IPromotionApplicableCategory,
  IncludeChildren,
  PromotionApplicableCategoryId,
  PromotionApplicableCategoryUpdatedAt,
  PromotionId,
} from 'src/promotion-applicable-categories/applications/domains/promotionApplicableCategory.domain';
import { CreatePromotionApplicableCategoryUseCase } from 'src/promotion-applicable-categories/applications/usecases/createPromotionApplicableCategory.usecase';
import { DeletePromotionApplicableCategoryByIdUseCase } from 'src/promotion-applicable-categories/applications/usecases/deletePromotionApplicableCategoryById.usecase';
import { GetAllPromotionApplicableCategoriesUseCase } from 'src/promotion-applicable-categories/applications/usecases/getAllPromotionApplicableCategories.usecase';
import { GetPromotionApplicableCategoriesByCategoryIdUseCase } from 'src/promotion-applicable-categories/applications/usecases/getPromotionApplicableCategoriesByCategoryId.usecase';
import { GetPromotionApplicableCategoriesByPromotionIdUseCase } from 'src/promotion-applicable-categories/applications/usecases/getPromotionApplicableCategoriesByPromotionId.usecase';
import { GetPromotionApplicableCategoryByAssociationUseCase } from 'src/promotion-applicable-categories/applications/usecases/getPromotionApplicableCategoryByAssociation.usecase';
import { GetPromotionApplicableCategoryByIdUseCase } from 'src/promotion-applicable-categories/applications/usecases/getPromotionApplicableCategoryById.usecase';
import { UpdatePromotionApplicableCategoryByIdUseCase } from 'src/promotion-applicable-categories/applications/usecases/updatePromotionApplicableCategoryById.usecase';
import { EStatus, type Status } from 'src/types/utility.type';
import { CreatePromotionApplicableCategoryDto } from './dto/createPromotionApplicableCategory.dto';
import { UpdatePromotionApplicableCategoryDto } from './dto/updatePromotionApplicableCategory.dto';

@ApiTags('Promotion Applicable Categories')
@UseGuards(JwtAuthGuard)
@Controller('promotion-applicable-categories')
export class PromotionApplicableCategoryController {
  constructor(
    private readonly createPromotionApplicableCategoryUseCase: CreatePromotionApplicableCategoryUseCase,
    private readonly deletePromotionApplicableCategoryByIdUseCase: DeletePromotionApplicableCategoryByIdUseCase,
    private readonly getAllPromotionApplicableCategoriesUseCase: GetAllPromotionApplicableCategoriesUseCase,
    private readonly updatePromotionApplicableCategoryByIdUseCase: UpdatePromotionApplicableCategoryByIdUseCase,
    private readonly getPromotionApplicableCategoryByIdUseCase: GetPromotionApplicableCategoryByIdUseCase,
    private readonly getPromotionApplicableCategoriesByPromotionIdUseCase: GetPromotionApplicableCategoriesByPromotionIdUseCase,
    private readonly getPromotionApplicableCategoriesByCategoryIdUseCase: GetPromotionApplicableCategoriesByCategoryIdUseCase,
    private readonly getPromotionApplicableCategoryByAssociationUseCase: GetPromotionApplicableCategoryByAssociationUseCase,
  ) {}

  @ApiOperation({ summary: 'Create a promotion applicable category association' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The promotion applicable category has been successfully created.',
  })
  @Post()
  @Transactional()
  create(
    @Body() createPromotionApplicableCategoryDto: CreatePromotionApplicableCategoryDto,
  ): Promise<IPromotionApplicableCategory> {
    const command = Builder<IPromotionApplicableCategory>()
      .promotionId(createPromotionApplicableCategoryDto.promotionId)
      .categoryId(createPromotionApplicableCategoryDto.categoryId)
      .includeChildren(createPromotionApplicableCategoryDto.includeChildren ?? (true as any))
      .status((createPromotionApplicableCategoryDto.status || EStatus.ACTIVE) as unknown as Status)
      .build();
    return this.createPromotionApplicableCategoryUseCase.execute(command);
  }

  @ApiOperation({ summary: 'Get all promotion applicable categories' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The promotion applicable categories have been successfully retrieved.',
  })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, type: String, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'promotionId', required: false, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: EStatus })
  @ApiQuery({ name: 'includeChildren', required: false, type: Boolean })
  @Get()
  @Transactional()
  getAll(
    @Query('sort') sort?: string,
    @Query('order') order?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('promotionId') promotionId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: string,
    @Query('includeChildren') includeChildren?: boolean,
  ) {
    return this.getAllPromotionApplicableCategoriesUseCase.execute({
      sort,
      order,
      page,
      limit,
      promotionId,
      categoryId,
      status,
      includeChildren,
    });
  }

  @ApiOperation({ summary: 'Get a promotion applicable category by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The promotion applicable category has been successfully retrieved.',
  })
  @ApiParam({ name: 'id', type: String, description: 'The id of the promotion applicable category' })
  @Get(':id')
  @Transactional()
  getById(@Param('id', ParseUUIDPipe) id: PromotionApplicableCategoryId): Promise<IPromotionApplicableCategory> {
    return this.getPromotionApplicableCategoryByIdUseCase.execute({ id });
  }

  @ApiOperation({ summary: 'Get promotion applicable categories by promotion id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The promotion applicable categories have been successfully retrieved.',
  })
  @ApiParam({ name: 'promotionId', type: String, description: 'The promotion id' })
  @Get('promotion/:promotionId')
  @Transactional()
  getByPromotionId(
    @Param('promotionId', ParseUUIDPipe) promotionId: PromotionId,
  ): Promise<IPromotionApplicableCategory[]> {
    return this.getPromotionApplicableCategoriesByPromotionIdUseCase.execute({ promotionId });
  }

  @ApiOperation({ summary: 'Get promotion applicable categories by category id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The promotion applicable categories have been successfully retrieved.',
  })
  @ApiParam({ name: 'categoryId', type: String, description: 'The category id' })
  @Get('category/:categoryId')
  @Transactional()
  getByCategoryId(@Param('categoryId', ParseUUIDPipe) categoryId: CategoryId): Promise<IPromotionApplicableCategory[]> {
    return this.getPromotionApplicableCategoriesByCategoryIdUseCase.execute({ categoryId });
  }

  @ApiOperation({ summary: 'Get promotion applicable category by association' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The promotion applicable category has been successfully retrieved.',
  })
  @ApiParam({ name: 'promotionId', type: String, description: 'The promotion id' })
  @ApiParam({ name: 'categoryId', type: String, description: 'The category id' })
  @Get('association/:promotionId/:categoryId')
  @Transactional()
  getByAssociation(
    @Param('promotionId', ParseUUIDPipe) promotionId: PromotionId,
    @Param('categoryId', ParseUUIDPipe) categoryId: CategoryId,
  ): Promise<IPromotionApplicableCategory> {
    return this.getPromotionApplicableCategoryByAssociationUseCase.execute({ promotionId, categoryId });
  }

  @ApiOperation({ summary: 'Update a promotion applicable category' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The promotion applicable category has been successfully updated.',
  })
  @ApiParam({ name: 'id', type: String, description: 'The id of the promotion applicable category' })
  @Put(':id')
  @Transactional()
  update(
    @Param('id', ParseUUIDPipe) id: PromotionApplicableCategoryId,
    @Body() updatePromotionApplicableCategoryDto: UpdatePromotionApplicableCategoryDto,
  ): Promise<IPromotionApplicableCategory> {
    const promotionApplicableCategory = StrictBuilder<IPromotionApplicableCategory>()
      .uuid(id)
      .promotionId(updatePromotionApplicableCategoryDto.promotionId as PromotionId)
      .categoryId(updatePromotionApplicableCategoryDto.categoryId as CategoryId)
      .includeChildren(updatePromotionApplicableCategoryDto.includeChildren as IncludeChildren)
      .status(updatePromotionApplicableCategoryDto.status as Status)
      .updatedAt(new Date() as PromotionApplicableCategoryUpdatedAt)
      .build();
    return this.updatePromotionApplicableCategoryByIdUseCase.execute(promotionApplicableCategory);
  }

  @ApiOperation({ summary: 'Delete a promotion applicable category' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The promotion applicable category has been successfully deleted.',
  })
  @ApiParam({ name: 'id', type: String, description: 'The id of the promotion applicable category' })
  @Delete(':id')
  @Transactional()
  delete(@Param('id', ParseUUIDPipe) id: PromotionApplicableCategoryId): Promise<void> {
    return this.deletePromotionApplicableCategoryByIdUseCase.execute({ id });
  }
}
