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
  IPromotionRule,
  PromotionRuleId,
  PromotionRuleMinAmount,
  PromotionRuleMinQty,
  PromotionRuleScope,
  PromotionRuleUpdatedAt,
} from 'src/promotion-rules/applications/domains/promotionRule.domain';
import { EPromotionRuleScope } from 'src/promotion-rules/applications/domains/promotionRule.domain';
import { CreatePromotionRuleUseCase } from 'src/promotion-rules/applications/usecases/createPromotionRule.usecase';
import { DeletePromotionRuleByIdUseCase } from 'src/promotion-rules/applications/usecases/deletePromotionRuleById.usecase';
import { GetAllPromotionRulesUseCase } from 'src/promotion-rules/applications/usecases/getAllPromotionRules.usecase';
import { GetPromotionRuleByIdUseCase } from 'src/promotion-rules/applications/usecases/getPromotionRuleById.usecase';
import { GetPromotionRulesByPromotionIdUseCase } from 'src/promotion-rules/applications/usecases/getPromotionRulesByPromotionId.usecase';
import { UpdatePromotionRuleByIdUseCase } from 'src/promotion-rules/applications/usecases/updatePromotionRuleById.usecase';
import type { PromotionId } from 'src/promotions/applications/domains/promotion.domain';
import { CreatePromotionRuleDto } from './dto/createPromotionRule.dto';
import { UpdatePromotionRuleDto } from './dto/updatePromotionRule.dto';

@ApiTags('Promotion Rules')
@UseGuards(JwtAuthGuard)
@Controller('promotion-rules')
export class PromotionRuleController {
  constructor(
    private readonly createPromotionRuleUseCase: CreatePromotionRuleUseCase,
    private readonly deletePromotionRuleByIdUseCase: DeletePromotionRuleByIdUseCase,
    private readonly getAllPromotionRulesUseCase: GetAllPromotionRulesUseCase,
    private readonly updatePromotionRuleByIdUseCase: UpdatePromotionRuleByIdUseCase,
    private readonly getPromotionRuleByIdUseCase: GetPromotionRuleByIdUseCase,
    private readonly getPromotionRulesByPromotionIdUseCase: GetPromotionRulesByPromotionIdUseCase,
  ) {}

  @ApiOperation({ summary: 'Create a promotion rule' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The promotion rule has been successfully created.',
  })
  @Post()
  @Transactional()
  create(@Body() createPromotionRuleDto: CreatePromotionRuleDto): Promise<IPromotionRule> {
    const command = Builder<IPromotionRule>()
      .promotionId(createPromotionRuleDto.promotionId)
      .scope(createPromotionRuleDto.scope as unknown as PromotionRuleScope)
      .minQty(createPromotionRuleDto.minQty)
      .minAmount(createPromotionRuleDto.minAmount)
      .build();
    return this.createPromotionRuleUseCase.execute(command);
  }

  @ApiOperation({ summary: 'Get all promotion rules' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The promotion rules have been successfully retrieved.',
  })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, type: String, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'promotionId', required: false, type: String })
  @ApiQuery({ name: 'scope', required: false, enum: EPromotionRuleScope })
  @Get()
  @Transactional()
  getAll(
    @Query('sort') sort?: string,
    @Query('order') order?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('promotionId') promotionId?: string,
    @Query('scope') scope?: string,
  ) {
    return this.getAllPromotionRulesUseCase.execute({
      sort,
      order,
      page,
      limit,
      promotionId,
      scope,
    });
  }

  @ApiOperation({ summary: 'Get promotion rules by promotion ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The promotion rules have been successfully retrieved.',
  })
  @ApiParam({ name: 'promotionId', type: String, description: 'The promotion ID' })
  @Get('by-promotion/:promotionId')
  @Transactional()
  getByPromotionId(@Param('promotionId', ParseUUIDPipe) promotionId: PromotionId): Promise<IPromotionRule[]> {
    return this.getPromotionRulesByPromotionIdUseCase.execute({ promotionId });
  }

  @ApiOperation({ summary: 'Get a promotion rule by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The promotion rule has been successfully retrieved.',
  })
  @ApiParam({ name: 'id', type: String, description: 'The id of the promotion rule' })
  @Get(':id')
  @Transactional()
  getById(@Param('id', ParseUUIDPipe) id: PromotionRuleId): Promise<IPromotionRule> {
    return this.getPromotionRuleByIdUseCase.execute({ id });
  }

  @ApiOperation({ summary: 'Update a promotion rule' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The promotion rule has been successfully updated.',
  })
  @ApiParam({ name: 'id', type: String, description: 'The id of the promotion rule' })
  @Put(':id')
  @Transactional()
  update(
    @Param('id', ParseUUIDPipe) id: PromotionRuleId,
    @Body() updatePromotionRuleDto: UpdatePromotionRuleDto,
  ): Promise<IPromotionRule> {
    const promotionRule = StrictBuilder<IPromotionRule>()
      .uuid(id)
      .scope(updatePromotionRuleDto.scope as PromotionRuleScope)
      .minQty(updatePromotionRuleDto.minQty as PromotionRuleMinQty)
      .minAmount(updatePromotionRuleDto.minAmount as PromotionRuleMinAmount)
      .promotionId(updatePromotionRuleDto.promotionId as PromotionId)
      .updatedAt(new Date() as PromotionRuleUpdatedAt)
      .build();

    return this.updatePromotionRuleByIdUseCase.execute(promotionRule);
  }

  @ApiOperation({ summary: 'Delete a promotion rule' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The promotion rule has been successfully deleted.',
  })
  @ApiParam({ name: 'id', type: String, description: 'The id of the promotion rule' })
  @Delete(':id')
  @Transactional()
  delete(@Param('id', ParseUUIDPipe) id: PromotionRuleId): Promise<void> {
    return this.deletePromotionRuleByIdUseCase.execute({ id });
  }
}
