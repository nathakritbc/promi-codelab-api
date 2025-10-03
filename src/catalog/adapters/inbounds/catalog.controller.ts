import { Transactional } from '@nestjs-cls/transactional';
import { Controller, Get, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';
import { accessKeyToken } from 'src/configs/jwt.config';
import { EStatus } from 'src/types/utility.type';
import { GetCatalogProductsUseCase } from '../../applications/usecases/getCatalogProducts.usecase';
import { CatalogProductListResponseDto } from './dto/catalogProductResponse.dto';

@ApiTags('Catalog')
@ApiBearerAuth(accessKeyToken)
@UseGuards(JwtAuthGuard)
@Controller('catalog')
export class CatalogController {
  constructor(private readonly getCatalogProductsUseCase: GetCatalogProductsUseCase) {}

  @ApiOperation({ summary: 'Get catalog products with applicable promotions' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Catalog products retrieved successfully',
    type: CatalogProductListResponseDto,
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, type: String, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: EStatus })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @Get('products')
  @Transactional()
  getCatalogProducts(
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('order') order?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
  ) {
    return this.getCatalogProductsUseCase.execute({
      search,
      sort,
      order,
      page,
      limit,
      status,
      minPrice,
      maxPrice,
    });
  }
}
