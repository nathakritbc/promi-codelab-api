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
  CategoryName,
  CategoryParentId,
  ICategory,
} from 'src/categories/applications/domains/category.domain';
import { CreateCategoryUseCase } from 'src/categories/applications/usecases/createCategory.usecase';
import { CreateRootCategoryUseCase } from 'src/categories/applications/usecases/createRootCategory.usecase';
import { DeleteCategoryByIdUseCase } from 'src/categories/applications/usecases/deleteCategoryById.usecase';
import { GetAllCategoriesUseCase } from 'src/categories/applications/usecases/getAllCategories.usecase';
import { GetCategoriesByParentIdUseCase } from 'src/categories/applications/usecases/getCategoriesByParentId.usecase';
import { GetCategoryByIdUseCase } from 'src/categories/applications/usecases/getCategoryById.usecase';
import { UpdateCategoryByIdUseCase } from 'src/categories/applications/usecases/updateCategoryById.usecase';
import { EStatus, type Status } from 'src/types/utility.type';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { UpdateCategoryDto } from './dto/updateCategory.dto';

@ApiTags('Categories')
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoryController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly deleteCategoryByIdUseCase: DeleteCategoryByIdUseCase,
    private readonly getAllCategoriesUseCase: GetAllCategoriesUseCase,
    private readonly updateCategoryByIdUseCase: UpdateCategoryByIdUseCase,
    private readonly getCategoryByIdUseCase: GetCategoryByIdUseCase,
    private readonly getCategoriesByParentIdUseCase: GetCategoriesByParentIdUseCase,
    private readonly createRootCategoryUseCase: CreateRootCategoryUseCase,
  ) {}

  @ApiOperation({ summary: 'Create a category' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'The category has been successfully created.' })
  @Post()
  @Transactional()
  create(@Body() createCategoryDto: CreateCategoryDto): Promise<ICategory> {
    const command = Builder<ICategory>()
      .name(createCategoryDto.name)
      .parentId(createCategoryDto.parentId)
      .ancestors(createCategoryDto.ancestors || [])
      .status((createCategoryDto.status || EStatus.ACTIVE) as Status)
      .build();
    return this.createCategoryUseCase.execute(command);
  }

  @ApiOperation({ summary: 'Create a root category' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'The category has been successfully created.' })
  @Post('root')
  @Transactional()
  createRootCategory(@Body() createCategoryDto: CreateCategoryDto): Promise<ICategory> {
    const command = Builder<ICategory>().name(createCategoryDto.name).build();
    return this.createRootCategoryUseCase.execute(command);
  }

  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The categories have been successfully retrieved.' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, type: String, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: EStatus })
  @ApiQuery({ name: 'parentId', required: false, type: String })
  @ApiQuery({ name: 'isRoot', required: false, type: Boolean })
  @Get()
  @Transactional()
  getAll(
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('order') order?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('parentId') parentId?: string,
    @Query('isRoot') isRoot?: boolean,
  ) {
    return this.getAllCategoriesUseCase.execute({ search, sort, order, page, limit, status, parentId, isRoot });
  }

  @ApiOperation({ summary: 'Get a category by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The category has been successfully retrieved.' })
  @ApiParam({ name: 'id', type: String, description: 'The id of the category' })
  @Get(':id')
  @Transactional()
  getById(@Param('id', ParseUUIDPipe) id: CategoryId): Promise<ICategory> {
    return this.getCategoryByIdUseCase.execute({ id });
  }

  @ApiOperation({ summary: 'Get categories by parent id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The categories have been successfully retrieved.' })
  @ApiParam({ name: 'parentId', type: String, description: 'The parent id of the categories' })
  @Get('parent/:parentId')
  @Transactional()
  getByParentId(@Param('parentId', ParseUUIDPipe) parentId: string): Promise<ICategory[]> {
    return this.getCategoriesByParentIdUseCase.execute({ parentId });
  }

  @ApiOperation({ summary: 'Update a category' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The category has been successfully updated.' })
  @ApiParam({ name: 'id', type: String, description: 'The id of the category' })
  @Put(':id')
  @Transactional()
  update(@Param('id', ParseUUIDPipe) id: CategoryId, @Body() updateCategoryDto: UpdateCategoryDto): Promise<ICategory> {
    const command = Builder<ICategory>()
      .uuid(id)
      .name(updateCategoryDto.name as CategoryName)
      .parentId(updateCategoryDto.parentId as CategoryParentId)
      .ancestors(updateCategoryDto.ancestors as string[])
      .status(updateCategoryDto.status as unknown as Status)
      .build();
    return this.updateCategoryByIdUseCase.execute(command);
  }

  @ApiOperation({ summary: 'Delete a category' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The category has been successfully deleted.' })
  @ApiParam({ name: 'id', type: String, description: 'The id of the category' })
  @Delete(':id')
  @Transactional()
  delete(@Param('id', ParseUUIDPipe) id: CategoryId): Promise<void> {
    return this.deleteCategoryByIdUseCase.execute({ id });
  }
}
