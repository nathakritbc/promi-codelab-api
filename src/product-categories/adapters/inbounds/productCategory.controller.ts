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
  CategoryId,
  IProductCategory,
  ProductCategoryId,
  ProductCategoryUpdatedAt,
  ProductId,
} from 'src/product-categories/applications/domains/productCategory.domain';
import { CreateProductCategoryUseCase } from 'src/product-categories/applications/usecases/createProductCategory.usecase';
import { DeleteProductCategoryByIdUseCase } from 'src/product-categories/applications/usecases/deleteProductCategoryById.usecase';
import { GetAllProductCategoriesUseCase } from 'src/product-categories/applications/usecases/getAllProductCategories.usecase';
import { GetProductCategoriesByCategoryIdUseCase } from 'src/product-categories/applications/usecases/getProductCategoriesByCategoryId.usecase';
import { GetProductCategoriesByProductIdUseCase } from 'src/product-categories/applications/usecases/getProductCategoriesByProductId.usecase';
import { GetProductCategoryByAssociationUseCase } from 'src/product-categories/applications/usecases/getProductCategoryByAssociation.usecase';
import { GetProductCategoryByIdUseCase } from 'src/product-categories/applications/usecases/getProductCategoryById.usecase';
import { UpdateProductCategoryByIdUseCase } from 'src/product-categories/applications/usecases/updateProductCategoryById.usecase';
import { EStatus, type Status } from 'src/types/utility.type';
import { CreateProductCategoryDto } from './dto/createProductCategory.dto';
import { UpdateProductCategoryDto } from './dto/updateProductCategory.dto';

@ApiTags('Product Categories')
@UseGuards(JwtAuthGuard)
@Controller('product-categories')
export class ProductCategoryController {
  constructor(
    private readonly createProductCategoryUseCase: CreateProductCategoryUseCase,
    private readonly deleteProductCategoryByIdUseCase: DeleteProductCategoryByIdUseCase,
    private readonly getAllProductCategoriesUseCase: GetAllProductCategoriesUseCase,
    private readonly updateProductCategoryByIdUseCase: UpdateProductCategoryByIdUseCase,
    private readonly getProductCategoryByIdUseCase: GetProductCategoryByIdUseCase,
    private readonly getProductCategoriesByProductIdUseCase: GetProductCategoriesByProductIdUseCase,
    private readonly getProductCategoriesByCategoryIdUseCase: GetProductCategoriesByCategoryIdUseCase,
    private readonly getProductCategoryByAssociationUseCase: GetProductCategoryByAssociationUseCase,
  ) {}

  @ApiOperation({ summary: 'Create a product category association' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'The product category has been successfully created.' })
  @Post()
  @Transactional()
  create(@Body() createProductCategoryDto: CreateProductCategoryDto): Promise<IProductCategory> {
    const command = Builder<IProductCategory>()
      .productId(createProductCategoryDto.productId)
      .categoryId(createProductCategoryDto.categoryId)
      .status((createProductCategoryDto.status || EStatus.ACTIVE) as unknown as Status)
      .build();
    return this.createProductCategoryUseCase.execute(command);
  }

  @ApiOperation({ summary: 'Get all product categories' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The product categories have been successfully retrieved.' })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, type: String, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'productId', required: false, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: EStatus })
  @Get()
  @Transactional()
  getAll(
    @Query('sort') sort?: string,
    @Query('order') order?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('productId') productId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: string,
  ) {
    return this.getAllProductCategoriesUseCase.execute({
      sort,
      order,
      page,
      limit,
      productId,
      categoryId,
      status,
    });
  }

  @ApiOperation({ summary: 'Get a product category by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The product category has been successfully retrieved.' })
  @ApiParam({ name: 'id', type: String, description: 'The id of the product category' })
  @Get(':id')
  @Transactional()
  getById(@Param('id', ParseUUIDPipe) id: ProductCategoryId): Promise<IProductCategory> {
    return this.getProductCategoryByIdUseCase.execute({ id });
  }

  @ApiOperation({ summary: 'Get product categories by product id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The product categories have been successfully retrieved.' })
  @ApiParam({ name: 'productId', type: String, description: 'The product id' })
  @Get('product/:productId')
  @Transactional()
  getByProductId(@Param('productId', ParseUUIDPipe) productId: ProductId): Promise<IProductCategory[]> {
    return this.getProductCategoriesByProductIdUseCase.execute({ productId });
  }

  @ApiOperation({ summary: 'Get product categories by category id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The product categories have been successfully retrieved.' })
  @ApiParam({ name: 'categoryId', type: String, description: 'The category id' })
  @Get('category/:categoryId')
  @Transactional()
  getByCategoryId(@Param('categoryId', ParseUUIDPipe) categoryId: CategoryId): Promise<IProductCategory[]> {
    return this.getProductCategoriesByCategoryIdUseCase.execute({ categoryId });
  }

  @ApiOperation({ summary: 'Get product category by association' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The product category has been successfully retrieved.' })
  @ApiParam({ name: 'productId', type: String, description: 'The product id' })
  @ApiParam({ name: 'categoryId', type: String, description: 'The category id' })
  @Get('association/:productId/:categoryId')
  @Transactional()
  getByAssociation(
    @Param('productId', ParseUUIDPipe) productId: ProductId,
    @Param('categoryId', ParseUUIDPipe) categoryId: CategoryId,
  ): Promise<IProductCategory> {
    return this.getProductCategoryByAssociationUseCase.execute({ productId, categoryId });
  }

  @ApiOperation({ summary: 'Update a product category' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The product category has been successfully updated.' })
  @ApiParam({ name: 'id', type: String, description: 'The id of the product category' })
  @Put(':id')
  @Transactional()
  update(
    @Param('id', ParseUUIDPipe) id: ProductCategoryId,
    @Body() updateProductCategoryDto: UpdateProductCategoryDto,
  ): Promise<IProductCategory> {
    const productCategory = Builder<IProductCategory>()
      .uuid(id)
      .productId(updateProductCategoryDto.productId as ProductId)
      .categoryId(updateProductCategoryDto.categoryId as CategoryId)
      .status(updateProductCategoryDto.status as Status)
      .updatedAt(new Date() as ProductCategoryUpdatedAt)
      .build();

    return this.updateProductCategoryByIdUseCase.execute(productCategory);
  }

  @ApiOperation({ summary: 'Delete a product category' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The product category has been successfully deleted.' })
  @ApiParam({ name: 'id', type: String, description: 'The id of the product category' })
  @Delete(':id')
  @Transactional()
  delete(@Param('id', ParseUUIDPipe) id: ProductCategoryId): Promise<void> {
    return this.deleteProductCategoryByIdUseCase.execute({ id });
  }
}
