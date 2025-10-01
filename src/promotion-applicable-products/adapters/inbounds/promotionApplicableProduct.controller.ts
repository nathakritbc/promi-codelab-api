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
  IPromotionApplicableProduct,
  ProductId,
  PromotionApplicableProductId,
  PromotionId,
} from 'src/promotion-applicable-products/applications/domains/promotionApplicableProduct.domain';
import { CreatePromotionApplicableProductUseCase } from 'src/promotion-applicable-products/applications/usecases/createPromotionApplicableProduct.usecase';
import { DeletePromotionApplicableProductByIdUseCase } from 'src/promotion-applicable-products/applications/usecases/deletePromotionApplicableProductById.usecase';
import { GetAllPromotionApplicableProductsUseCase } from 'src/promotion-applicable-products/applications/usecases/getAllPromotionApplicableProducts.usecase';
import { GetPromotionApplicableProductByAssociationUseCase } from 'src/promotion-applicable-products/applications/usecases/getPromotionApplicableProductByAssociation.usecase';
import { GetPromotionApplicableProductByIdUseCase } from 'src/promotion-applicable-products/applications/usecases/getPromotionApplicableProductById.usecase';
import { GetPromotionApplicableProductsByProductIdUseCase } from 'src/promotion-applicable-products/applications/usecases/getPromotionApplicableProductsByProductId.usecase';
import { GetPromotionApplicableProductsByPromotionIdUseCase } from 'src/promotion-applicable-products/applications/usecases/getPromotionApplicableProductsByPromotionId.usecase';
import { UpdatePromotionApplicableProductByIdUseCase } from 'src/promotion-applicable-products/applications/usecases/updatePromotionApplicableProductById.usecase';
import { EStatus, type Status } from 'src/types/utility.type';
import { CreatePromotionApplicableProductDto } from './dto/createPromotionApplicableProduct.dto';
import type { UpdatePromotionApplicableProductDto } from './dto/updatePromotionApplicableProduct.dto';

@ApiTags('Promotion Applicable Products')
@UseGuards(JwtAuthGuard)
@Controller('promotion-applicable-products')
export class PromotionApplicableProductController {
  constructor(
    private readonly createPromotionApplicableProductUseCase: CreatePromotionApplicableProductUseCase,
    private readonly deletePromotionApplicableProductByIdUseCase: DeletePromotionApplicableProductByIdUseCase,
    private readonly getAllPromotionApplicableProductsUseCase: GetAllPromotionApplicableProductsUseCase,
    private readonly updatePromotionApplicableProductByIdUseCase: UpdatePromotionApplicableProductByIdUseCase,
    private readonly getPromotionApplicableProductByIdUseCase: GetPromotionApplicableProductByIdUseCase,
    private readonly getPromotionApplicableProductsByPromotionIdUseCase: GetPromotionApplicableProductsByPromotionIdUseCase,
    private readonly getPromotionApplicableProductsByProductIdUseCase: GetPromotionApplicableProductsByProductIdUseCase,
    private readonly getPromotionApplicableProductByAssociationUseCase: GetPromotionApplicableProductByAssociationUseCase,
  ) {}

  @ApiOperation({ summary: 'Create a promotion applicable product association' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The promotion applicable product has been successfully created.',
  })
  @Post()
  @Transactional()
  create(
    @Body() createPromotionApplicableProductDto: CreatePromotionApplicableProductDto,
  ): Promise<IPromotionApplicableProduct> {
    const command = Builder<IPromotionApplicableProduct>()
      .promotionId(createPromotionApplicableProductDto.promotionId)
      .productId(createPromotionApplicableProductDto.productId)
      .status((createPromotionApplicableProductDto.status || EStatus.ACTIVE) as unknown as Status)
      .build();
    return this.createPromotionApplicableProductUseCase.execute(command);
  }

  @ApiOperation({ summary: 'Get all promotion applicable products' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The promotion applicable products have been successfully retrieved.',
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, type: String, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'promotionId', required: false, type: String })
  @ApiQuery({ name: 'productId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: EStatus })
  @Get()
  @Transactional()
  getAll(
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('order') order?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('promotionId') promotionId?: string,
    @Query('productId') productId?: string,
    @Query('status') status?: string,
  ) {
    return this.getAllPromotionApplicableProductsUseCase.execute({
      search,
      sort,
      order,
      page,
      limit,
      promotionId,
      productId,
      status,
    });
  }

  @ApiOperation({ summary: 'Get a promotion applicable product by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The promotion applicable product has been successfully retrieved.',
  })
  @ApiParam({ name: 'id', type: String, description: 'The id of the promotion applicable product' })
  @Get(':id')
  @Transactional()
  getById(@Param('id', ParseUUIDPipe) id: PromotionApplicableProductId): Promise<IPromotionApplicableProduct> {
    return this.getPromotionApplicableProductByIdUseCase.execute({ id });
  }

  @ApiOperation({ summary: 'Get promotion applicable products by promotion id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The promotion applicable products have been successfully retrieved.',
  })
  @ApiParam({ name: 'promotionId', type: String, description: 'The promotion id' })
  @Get('promotion/:promotionId')
  @Transactional()
  getByPromotionId(
    @Param('promotionId', ParseUUIDPipe) promotionId: PromotionId,
  ): Promise<IPromotionApplicableProduct[]> {
    return this.getPromotionApplicableProductsByPromotionIdUseCase.execute({ promotionId });
  }

  @ApiOperation({ summary: 'Get promotion applicable products by product id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The promotion applicable products have been successfully retrieved.',
  })
  @ApiParam({ name: 'productId', type: String, description: 'The product id' })
  @Get('product/:productId')
  @Transactional()
  getByProductId(@Param('productId', ParseUUIDPipe) productId: ProductId): Promise<IPromotionApplicableProduct[]> {
    return this.getPromotionApplicableProductsByProductIdUseCase.execute({ productId });
  }

  @ApiOperation({ summary: 'Get promotion applicable product by association' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The promotion applicable product has been successfully retrieved.',
  })
  @ApiParam({ name: 'promotionId', type: String, description: 'The promotion id' })
  @ApiParam({ name: 'productId', type: String, description: 'The product id' })
  @Get('association/:promotionId/:productId')
  @Transactional()
  getByAssociation(
    @Param('promotionId', ParseUUIDPipe) promotionId: PromotionId,
    @Param('productId', ParseUUIDPipe) productId: ProductId,
  ): Promise<IPromotionApplicableProduct> {
    return this.getPromotionApplicableProductByAssociationUseCase.execute({ promotionId, productId });
  }

  @ApiOperation({ summary: 'Update a promotion applicable product' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The promotion applicable product has been successfully updated.',
  })
  @ApiParam({ name: 'id', type: String, description: 'The id of the promotion applicable product' })
  @Put(':id')
  @Transactional()
  update(
    @Param('id', ParseUUIDPipe) id: PromotionApplicableProductId,
    @Body() updatePromotionApplicableProductDto: UpdatePromotionApplicableProductDto,
  ): Promise<IPromotionApplicableProduct> {
    const command = Builder<IPromotionApplicableProduct>()
      .uuid(id)
      .promotionId(updatePromotionApplicableProductDto.promotionId as PromotionId)
      .productId(updatePromotionApplicableProductDto.productId as ProductId)
      .status(updatePromotionApplicableProductDto.status as unknown as Status)
      .build();
    return this.updatePromotionApplicableProductByIdUseCase.execute(command);
  }

  @ApiOperation({ summary: 'Delete a promotion applicable product' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The promotion applicable product has been successfully deleted.',
  })
  @ApiParam({ name: 'id', type: String, description: 'The id of the promotion applicable product' })
  @Delete(':id')
  @Transactional()
  delete(@Param('id', ParseUUIDPipe) id: PromotionApplicableProductId): Promise<void> {
    return this.deletePromotionApplicableProductByIdUseCase.execute({ id });
  }
}
