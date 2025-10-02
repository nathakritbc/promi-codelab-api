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
  IProduct,
  ProductCode,
  ProductDescription,
  ProductId,
  ProductName,
  ProductPrice,
  ProductUpdatedAt,
} from 'src/products/applications/domains/product.domain';
import { CreateProductUseCase } from 'src/products/applications/usecases/createProduct.usecase';
import { DeleteProductByIdUseCase } from 'src/products/applications/usecases/deleteProductById.usecase';
import { GetAllProductsUseCase } from 'src/products/applications/usecases/getAllProducts.usecase';
import { GetProductByIdUseCase } from 'src/products/applications/usecases/getProductById.usecase';
import { UpdateProductByIdUseCase } from 'src/products/applications/usecases/updateProductById.usecase';
import { EStatus, type Status } from 'src/types/utility.type';
import { CreateProductDto } from './dto/createProduct.dto';
import { UpdateProductDto } from './dto/updateProduct.dto';

@ApiTags('Products')
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly deleteProductByIdUseCase: DeleteProductByIdUseCase,
    private readonly getAllProductsUseCase: GetAllProductsUseCase,
    private readonly updateProductByIdUseCase: UpdateProductByIdUseCase,
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
  ) {}

  @ApiOperation({ summary: 'Create a product' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'The product has been successfully created.' })
  @Post()
  @Transactional()
  create(@Body() createProductDto: CreateProductDto): Promise<IProduct> {
    const command = Builder<IProduct>()
      .code(createProductDto.code)
      .name(createProductDto.name)
      .description(createProductDto.description)
      .price(createProductDto.price)
      .status((createProductDto.status || EStatus.ACTIVE) as unknown as Status)
      .build();
    return this.createProductUseCase.execute(command);
  }

  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The products have been successfully retrieved.' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, type: String, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: EStatus })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @Get()
  @Transactional()
  getAll(
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('order') order?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
  ) {
    return this.getAllProductsUseCase.execute({ search, sort, order, page, limit, status, minPrice, maxPrice });
  }

  @ApiOperation({ summary: 'Get a product by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The product has been successfully retrieved.' })
  @ApiParam({ name: 'id', type: String, description: 'The id of the product' })
  @Get(':id')
  @Transactional()
  getById(@Param('id', ParseUUIDPipe) id: ProductId): Promise<IProduct> {
    return this.getProductByIdUseCase.execute({ id });
  }

  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The product has been successfully updated.' })
  @ApiParam({ name: 'id', type: String, description: 'The id of the product' })
  @Put(':id')
  @Transactional()
  update(@Param('id', ParseUUIDPipe) id: ProductId, @Body() updateProductDto: UpdateProductDto): Promise<IProduct> {
    const product = StrictBuilder<IProduct>()
      .uuid(id)
      .name(updateProductDto.name as ProductName)
      .code(updateProductDto.code as ProductCode)
      .description(updateProductDto.description as ProductDescription)
      .price(updateProductDto.price as ProductPrice)
      .status(updateProductDto.status as Status)
      .updatedAt(new Date() as ProductUpdatedAt)
      .build();
    return this.updateProductByIdUseCase.execute(product);
  }

  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The product has been successfully deleted.' })
  @ApiParam({ name: 'id', type: String, description: 'The id of the product' })
  @Delete(':id')
  @Transactional()
  delete(@Param('id', ParseUUIDPipe) id: ProductId): Promise<void> {
    return this.deleteProductByIdUseCase.execute({ id });
  }
}
