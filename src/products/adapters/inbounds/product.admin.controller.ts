import { Transactional } from '@nestjs-cls/transactional';
import { Controller, Get, HttpStatus, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';
import type { IProduct, ProductId } from 'src/products/applications/domains/product.domain';
import { GetProductByIdUseCase } from 'src/products/applications/usecases/getProductById.usecase';

@ApiTags('Products')
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductAdminController {
  constructor(private readonly getProductByIdUseCase: GetProductByIdUseCase) {}

  @ApiOperation({ summary: 'Get a product by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The product has been successfully retrieved.' })
  @ApiParam({ name: 'id', type: String, description: 'The id of the product' })
  @Get('/admin/:id')
  @Transactional()
  getById(@Param('id', ParseUUIDPipe) id: ProductId): Promise<IProduct> {
    return this.getProductByIdUseCase.execute({ id });
  }
}
