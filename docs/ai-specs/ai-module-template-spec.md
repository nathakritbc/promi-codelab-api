# AI Module Template Specification - NestJS Hexagonal Architecture

## 🎯 Overview

This template provides a standardized approach for creating new modules within the NestJS Hexagonal Architecture project. Follow this guide to implement new domain modules consistently and efficiently.

## 📋 Quick Start Checklist

### Pre-Development
- [ ] Define module domain and boundaries
- [ ] Identify business entities and value objects
- [ ] List required use cases and operations
- [ ] Plan external dependencies and integrations
- [ ] Design database schema requirements

### Development Phases
- [ ] **Phase 1**: Write UseCase tests first (TDD approach)
- [ ] **Phase 2**: Implement domain layer (business logic)
- [ ] **Phase 3**: Create repository interface (port)
- [ ] **Phase 4**: Implement use cases (application logic)
- [ ] **Phase 5**: Create database adapters (TypeORM)
- [ ] **Phase 6**: Build API controllers (inbound adapters)
- [ ] **Phase 7**: Configure module and run tests
- [ ] **Phase 8**: ⚠️ **CRITICAL** - Create migration with indexes (DON'T RUN YET!)
- [ ] **Phase 9**: ⚠️ **MANDATORY** - Index optimization review (see `ai-index-optimization-spec.md`)
- [ ] **Phase 10**: Update migration with optimized indexes
- [ ] **Phase 11**: Run migration and verify

## 🏗️ Module Structure

```
src/{MODULE_NAME}/
├── adapters/
│   ├── inbounds/                    # API Layer
│   │   ├── {Entity}.controller.ts
│   │   ├── create{Entity}.dto.ts
│   │   ├── update{Entity}.dto.ts
│   │   ├── {Entity}Response.dto.ts
│   │   └── {Entity}.http      # HTTP client testing
│   └── outbounds/                   # Database Layer
│       ├── {Entity}.entity.ts
│       └── {Entity}.typeorm.repository.ts
├── applications/
│   ├── domains/                     # Business Logic
│   │   ├── {Entity}.domain.ts
│   │   └── {Entity}.domain.spec.ts  # Only if domain has methods
│   ├── ports/                       # Repository Interface
│   │   └── {Entity}.repository.ts
│   └── usecases/                    # Application Logic
│       ├── create{Entity}.usecase.ts
│       ├── create{Entity}.usecase.spec.ts
│       ├── get{Entity}ById.usecase.ts
│       ├── get{Entity}ById.usecase.spec.ts
│       ├── getAll{Entity}s.usecase.ts
│       ├── getAll{Entity}s.usecase.spec.ts
│       ├── update{Entity}.usecase.ts
│       ├── update{Entity}.usecase.spec.ts
│       ├── delete{Entity}.usecase.ts
│       └── delete{Entity}.usecase.spec.ts
└── {MODULE_NAME}.module.ts
```

## 🧪 TDD-First Development Approach

### Core Principles
1. **Test First**: Write failing tests before implementation
2. **Red → Green → Refactor**: Fail → Pass → Improve cycle
3. **100% Coverage**: Aim for complete test coverage on business logic
4. **Mock Dependencies**: Keep tests isolated from infrastructure

### Testing Commands
```bash
pnpm test:watch          # Run tests continuously
pnpm test {file}         # Run specific test file
pnpm test:cov            # Check coverage report
pnpm test:e2e            # Run end-to-end tests
```

### Testing Order
1. **UseCase Tests First** → Implement UseCase → **Domain Tests** (if methods exist)
2. Keep repository dependencies mocked
3. Focus on business logic isolation
4. Reference: `docs/ai-specs/unit-test-spec.md` for detailed patterns

## 🎯 Implementation Steps

### Step 1: Domain Layer (Core Business Logic)

#### Domain Entity Template
```typescript
import { Builder } from 'builder-pattern';
import type { Brand, Status } from 'src/types/utility.type';

// Branded types for type safety
export type {Entity}Id = Brand<string, '{Entity}Id'>;
export type {Entity}Price = Brand<number, '{Entity}Price'>;
export type {Entity}CreatedAt = Brand<CreatedAt, '{Entity}CreatedAt'>;
export type {Entity}UpdatedAt = Brand<UpdatedAt, '{Entity}UpdatedAt'>;

export interface I{Entity} {
  uuid: {Entity}Id;
  price: {Entity}Price;
  status: Status;
  createdAt?: {Entity}CreatedAt;
  updatedAt?: {Entity}UpdatedAt;
  // Add your domain properties here
}

export class {Entity} implements I{Entity} {
  uuid: {Entity}Id;
  price: {Entity}Price;
  status: Status;
  createdAt?: {Entity}CreatedAt;
  updatedAt?: {Entity}UpdatedAt;
  
  // Add business logic methods ONLY if needed
  // Example: validate(), canBeDeleted(), etc.
  // Do not create methods just for the sake of having them
}
```

#### Domain Test Template (Only if domain has methods)
```typescript
import { describe, it, expect } from 'vitest';
import { {Entity} } from './{Entity}.domain';

describe('{Entity}Domain', () => {
  describe('business logic methods', () => {
    it('should validate required properties', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### Step 2: Repository Interface (Port)

#### Repository Interface Template
```typescript
import { GetAllMetaType, GetAllParamsType } from 'src/types/utility.type';
import { {Entity}Id, I{Entity} } from '../domains/{entity}.domain';

export type Update{Entity}Command = Partial<Omit<I{Entity}, 'uuid' | 'createdAt' | 'updatedAt'>>;

export interface GetAll{Entity}ReturnType {
  result: I{Entity}[];
  meta: GetAllMetaType;
}

const {entity}RepositoryTokenSymbol: unique symbol = Symbol('{Entity}Repository');
export const {entity}RepositoryToken = {entity}RepositoryTokenSymbol.toString();

export interface {Entity}Repository {
  create({Entity}: I{Entity}): Promise<I{Entity}>;
  delete{Entity}ById({ id }: { id: {Entity}Id }): Promise<void>;
  getAll{Entity}s(params: GetAllParamsType): Promise<GetAll{Entity}ReturnType>;
  get{Entity}ById({ id }: { id: {Entity}Id }): Promise<I{Entity} | undefined>;
  update{Entity}ById({entity}: I{Entity}): Promise<I{Entity}>;
}
```

### Step 3: Use Cases (Application Logic)

#### Create Use Case Template
```typescript
import { Inject, Injectable } from '@nestjs/common';
import { I{Entity} } from '../domains/{Entity}.domain';
import type { Create{Entity}Command, {Entity}Repository } from '../ports/{Entity}.repository';
import { {entity}RepositoryToken } from '../ports/{Entity}.repository';

@Injectable()
export class Create{Entity}UseCase {
  constructor(
    @Inject({entity}RepositoryToken)
    private readonly {entity}Repository: {Entity}Repository,
  ) {}

  async execute({entity}: Create{Entity}Command): Promise<I{Entity}> {
    return await this.{entity}Repository.create({entity});
  }
}
```

#### GetAll Use Case Template
```typescript
import { Inject, Injectable } from '@nestjs/common';
import type { GetAllParamsType } from 'src/types/utility.type';
import type { GetAllReturnType, {Entity}Repository } from '../ports/{Entity}.repository';
import { {entity}RepositoryToken } from '../ports/{Entity}.repository';

@Injectable()
export class GetAll{Entity}sUseCase {
  constructor(
    @Inject({entity}RepositoryToken)
    private readonly {entity}Repository: {Entity}Repository,
  ) {}

  async execute(params: GetAllParamsType): Promise<GetAllReturnType> {
    return this.{entity}Repository.getAll({
      search: params.search,
      sort: params.sort,
      order: params.order,
      page: params.page,
      limit: params.limit,
    });
  }
}
```

#### GetById Use Case Template
```typescript
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { {Entity}Id } from 'src/{entity}s/applications/domains/{entity}.domain';
import type { {Entity}Id, I{Entity} } from '../domains/{entity}.domain';
import type { {Entity}Repository } from '../ports/{entity}.repository';
import { {entity}RepositoryToken } from '../ports/{entity}.repository';

@Injectable()
export class Get{Entity}ByIdUseCase {
  constructor(
    @Inject({entity}RepositoryToken)
    private readonly {entity}Repository: {Entity}Repository,
  ) {}

  async execute({ id, {entity}Id }: { id: {Entity}Id; {entity}Id: UserId }): Promise<I{Entity}> {
    const {entity} = await this.{entity}Repository.get{Entity}ById({ id, userId });
    if (!{entity}) throw new NotFoundException('{Entity} not found');

    return {entity};
  }
}

```

#### UpdateById Use Case Template
```typescript
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { type I{Entity} } from '../domains/{entity}.domain';
import type { {Entity}Repository } from '../ports/{entity}.repository';
import { {entity}RepositoryToken } from '../ports/{entity}.repository';

@Injectable()
export class Update{Entity}ByIdUseCase {
  constructor(
    @Inject({entity}RepositoryToken)
    private readonly {entity}Repository: {Entity}Repository,
  ) {}

  async execute({entity}: I{Entity}): Promise<I{Entity}> {
    const existing{Entity} = await this.{entity}Repository.getById({ id: {entity}.uuid, userId: {entity}.userId });
    if (!existing{Entity}) throw new NotFoundException('{Entity} not found');

    return this.{entity}Repository.update{Entity}ById({entity});
  }
}


```

#### Delete Use Case Template
```typescript
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { {Entity}Id } from '../domains/{Entity}.domain';
import type { {Entity}Repository } from '../ports/{Entity}.repository';
import { {entity}RepositoryToken } from '../ports/{Entity}.repository';

@Injectable()
export class Delete{Entity}ByIdUseCase {
  constructor(
    @Inject({entity}RepositoryToken)
    private readonly {entity}Repository: {Entity}Repository,
  ) {}

  async execute(id: {Entity}Id): Promise<void> {
    const {Entity}Found = await this.{entity}Repository.getById(id);
    if (!{Entity}Found) throw new NotFoundException('{Entity} not found');
    return this.{entity}Repository.deleteById(id);
  }
}
```

### Step 4: Database Layer (Outbound Adapters)

#### TypeORM Entity Template
```typescript
import type {
  {Entity}CreatedAt,
  {Entity}Description,
  {Entity}Id,
  {Entity}Image,
  {Entity}Name,
  {Entity}Price,
  {Entity}UpdatedAt,
} from 'src/{Entity}s/applications/domains/{Entity}.domain';
import type { Status } from 'src/types/utility.type';
import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

export const {Entity}TableName = '{Entity}s';

@Entity({ name: {Entity}TableName })
export class {Entity}Entity {
  @PrimaryColumn({
    type: 'uuid',
    name: 'uuid',
    default: 'gen_random_uuid()',
  })
  uuid: {Entity}Id;

  @Column({ type: 'varchar' })
  name: {Entity}Name;

  @Column({ type: 'float' })
  price: {Entity}Price;

  @Column({ type: 'varchar', nullable: true })
  description?: {Entity}Description;

  @Column({ type: 'varchar', default: 'active' })
  status: Status;

  @CreateDateColumn()
  declare createdAt: {Entity}CreatedAt;

  @UpdateDateColumn()
  declare updatedAt: {Entity}UpdatedAt;
}
```

#### Repository Implementation Template
```typescript
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Injectable } from '@nestjs/common';
import { Builder, StrictBuilder } from 'builder-pattern';
import type { I{Entity}, {Entity}Id } from '../domains/{Entity}.domain';
import { {Entity}Repository } from '../ports/{Entity}.repository';
import { GetAllMetaType, GetAllParamsType } from 'src/types/utility.type';
import { {Entity}Entity } from './{Entity}.entity';
import { paginateQueryBuilder, PaginationParams } from '../../../utils/pagination.util';

@Injectable()
export class {Entity}TypeOrmRepository implements {Entity}Repository {
  constructor(private readonly {entity}Model: TransactionHost<TransactionalAdapterTypeOrm>) {}

  async create({entity}: I{Entity}): Promise<I{Entity}> {
    const resultCreated = await this.{entity}Model.tx
      .getRepository({Entity}Entity)
      .save({entity});
    return {Entity}TypeOrmRepository.toDomain(resultCreated as {Entity}Entity);
  }

  async deleteById(id: {Entity}Id): Promise<void> {
    await this.{entity}Model.tx
      .getRepository({Entity}Entity)
      .delete({ uuid: id });
  }

  async getAll(params: GetAll{Entity}Query): Promise<GetAll{Entity}ReturnType> {
    const { search, sort, order, page, limit, category, startDate, endDate } = params;
    const currentPage = page ?? 1;
    const currentLimit = limit ?? 10;

    const repo = this.{entity}Model.tx.getRepository({Entity}Entity);
    const qb = repo.createQueryBuilder('{entity}');

    // Apply filters
    if (search) {
      qb.andWhere('({entity}.title ILIKE :search OR {entity}.notes ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (category) {
      qb.andWhere('{entity}.category = :category', { category });
    }

    if (startDate) {
      qb.andWhere('{entity}.date >= :startDate', { startDate: new Date(startDate) });
    }

    if (endDate) {
      qb.andWhere('{entity}.date <= :endDate', { endDate: new Date(endDate) });
    }

    // Sorting and pagination
    const sortableColumns = ['title', 'amount', 'date', 'category', 'createdAt'];
    const isValidSort = sort && sortableColumns.includes(sort);
    const sortOrder = order === 'ASC' ? 'ASC' : 'DESC';

    if (isValidSort) {
      qb.orderBy(`{entity}.${sort}`, sortOrder);
    } else {
      qb.orderBy('{entity}.date', 'DESC');
    }

    const paginationParams = StrictBuilder<PaginationParams>().page(page).limit(limit).build();

    const { records: {entity}s, meta } = await paginateQueryBuilder(qb, paginationParams);

    // Map to domain objects
    const result = {entity}s.map(({entity}) => {Entity}TypeOrmRepository.toDomain({entity}));

    return StrictBuilder<GetAll{Entity}sReturnType>().result(result).meta(meta).build();
  }

  async updateById(id: {Entity}Id, {entity}: Partial<I{Entity}>): Promise<I{Entity}> {
    await this.{entity}Model.tx
      .getRepository({Entity}Entity)
      .update({ uuid: id }, {entity});
    
    const updated{Entity} = await this.{entity}Model.tx
      .getRepository({Entity}Entity)
      .findOne({ where: { uuid: id } });
    
    return {Entity}TypeOrmRepository.toDomain(updated{Entity} as {Entity}Entity);
  }

  public static toDomain({Entity}Entity: {Entity}Entity): I{Entity} {
    return Builder<I{Entity}>()
      .uuid({Entity}Entity.uuid as {Entity}Id)
      .name({Entity}Entity.name as {Entity}Name)
      .price({Entity}Entity.price as {Entity}Price)
      .description({Entity}Entity.description as {Entity}Description)
      .status({Entity}Entity.status as Status)
      .createdAt({Entity}Entity.createdAt as {Entity}CreatedAt)
      .updatedAt({Entity}Entity.updatedAt as {Entity}UpdatedAt)
      .build();
  }
}
```

### Step 5: API Layer (Inbound Adapters)

#### DTO Templates

**Create DTO**
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import type {
  {Entity}Description,
  {Entity}Image,
  {Entity}Name,
  {Entity}Price,
} from 'src/{Entity}s/applications/domains/{Entity}.domain';

export class Create{Entity}Dto {
  @ApiProperty({
    type: String,
    example: 'Sample {Entity}',
    description: 'The name of the {Entity}',
  })
  @IsNotEmpty()
  name: {Entity}Name;

  @ApiProperty({
    type: Number,
    example: 100.75,
    description: 'The price of the {Entity}',
  })
  @IsNotEmpty()
  price: {Entity}Price;

  @ApiProperty({
    type: String,
    example: 'https://example.com/image.jpg',
    description: 'The image URL of the {Entity}',
    required: false,
  })
  @IsOptional()
  image?: {Entity}Image;

  @ApiProperty({
    type: String,
    example: 'Description text',
    description: 'The description of the {Entity}',
    required: false,
  })
  @IsOptional()
  description?: {Entity}Description;
}
```

**Update DTO**
```typescript
import { PartialType } from '@nestjs/swagger';
import { Create{Entity}Dto } from './create{Entity}.dto';

export class Update{Entity}Dto extends PartialType(Create{Entity}Dto) {}
```

**Response DTO**
```typescript
import { ApiProperty } from '@nestjs/swagger';
import type {
  {Entity}Id,
  {Entity}CreatedAt,
  {Entity}UpdatedAt
} from 'src/{Entity}s/applications/domains/{Entity}.domain';

export class {Entity}ResponseDto {
  @ApiProperty()
  uuid: {Entity}Id;

  @ApiProperty()
  name: {Entity}Name;

  @ApiProperty()
  price: {Entity}Price;

  @ApiProperty()
  description?: {Entity}Description;

  @ApiProperty()
  image?: {Entity}Image;

  @ApiProperty()
  status: Status;

  @ApiProperty()
  createdAt: {Entity}CreatedAt;

  @ApiProperty()
  updatedAt: {Entity}UpdatedAt;
}
```

#### Controller Template
```typescript
import { Transactional } from '@nestjs-cls/transactional';
import { Body, Controller, Delete, Get, HttpStatus, Param, ParseUUIDPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { accessKeyToken } from 'src/configs/jwt.config';
import { Builder } from 'builder-pattern';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';
import type { I{Entity}, {Entity}Id } from 'src/{Entity}s/applications/domains/{Entity}.domain';
import { Create{Entity}UseCase } from 'src/{Entity}s/applications/usecases/create{Entity}.usecase';
import { Delete{Entity}ByIdUseCase } from 'src/{Entity}s/applications/usecases/delete{Entity}ById.usecase';
import { GetAll{Entity}sUseCase } from 'src/{Entity}s/applications/usecases/getAll{Entity}s.usecase';
import { Get{Entity}ByIdUseCase } from 'src/{Entity}s/applications/usecases/get{Entity}ById.usecase';
import { Update{Entity}ByIdUseCase } from 'src/{Entity}s/applications/usecases/update{Entity}ById.usecase';
import { Create{Entity}Dto } from './dto/create{Entity}.dto';
import type { Update{Entity}Dto } from './dto/update{Entity}.dto';

@ApiBearerAuth(accessKeyToken)
@UseGuards(JwtAuthGuard)
@Controller('{Entity}s')
export class {Entity}Controller {
  constructor(
    private readonly create{Entity}UseCase: Create{Entity}UseCase,
    private readonly delete{Entity}ByIdUseCase: Delete{Entity}ByIdUseCase,
    private readonly getAll{Entity}sUseCase: GetAll{Entity}sUseCase,
    private readonly update{Entity}ByIdUseCase: Update{Entity}ByIdUseCase,
    private readonly get{Entity}ByIdUseCase: Get{Entity}ByIdUseCase,
  ) {}

  @ApiOperation({ summary: 'Create a {Entity}' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The {Entity} has been successfully created.' })
  @Post()
  @Transactional()
  create(@Body() create{Entity}Dto: Create{Entity}Dto): Promise<I{Entity}> {
    const command = Builder<I{Entity}>()
      .name(create{Entity}Dto.name)
      .price(create{Entity}Dto.price)
      .image(create{Entity}Dto.image)
      .description(create{Entity}Dto.description)
      .build();
    return this.create{Entity}UseCase.execute(command);
  }

  @ApiOperation({ summary: 'Get all {Entity}s' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The {Entity}s have been successfully retrieved.' })
  @Get()
  @Transactional()
  getAll(
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('order') order?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.getAll{Entity}sUseCase.execute({ search, sort, order, page, limit });
  }

  @ApiOperation({ summary: 'Get a {Entity} by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The {Entity} has been successfully retrieved.' })
  @ApiParam({ name: 'id', type: String, description: 'The id of the {Entity}' })
  @Get(':id')
  @Transactional()
  getById(@Param('id', ParseUUIDPipe) id: {Entity}Id): Promise<I{Entity} | undefined> {
    return this.get{Entity}ByIdUseCase.execute(id);
  }

  @ApiOperation({ summary: 'Update a {Entity}' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The {Entity} has been successfully updated.' })
  @ApiParam({ name: 'id', type: String, description: 'The id of the {Entity}' })
  @Put(':id')
  @Transactional()
  update(@Param('id', ParseUUIDPipe) id: {Entity}Id, @Body() update{Entity}Dto: Update{Entity}Dto): Promise<I{Entity}> {
    const command = Builder<I{Entity}>()
      .name(update{Entity}Dto.name)
      .price(update{Entity}Dto.price)
      .image(update{Entity}Dto.image)
      .description(update{Entity}Dto.description)
      .build();
    return this.update{Entity}ByIdUseCase.execute(id, command);
  }

  @ApiOperation({ summary: 'Delete a {Entity}' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The {Entity} has been successfully deleted.' })
  @ApiParam({ name: 'id', type: String, description: 'The id of the {Entity}' })
  @Delete(':id')
  @Transactional()
  delete(@Param('id', ParseUUIDPipe) id: {Entity}Id): Promise<void> {
    return this.delete{Entity}ByIdUseCase.execute(id);
  }
}
```

### Step 6: Module Configuration

#### Module Template
```typescript
import { Module } from '@nestjs/common';

// Controllers
import { {Entity}Controller } from './adapters/inbounds/{Entity}.controller';

// Use Cases
import { Create{Entity}UseCase } from './applications/usecases/create{Entity}.usecase';
import { Delete{Entity}ByIdUseCase } from './applications/usecases/delete{Entity}ById.usecase';
import { GetAll{Entity}sUseCase } from './applications/usecases/getAll{Entity}s.usecase';
import { Get{Entity}ByIdUseCase } from './applications/usecases/get{Entity}ById.usecase';
import { Update{Entity}ByIdUseCase } from './applications/usecases/update{Entity}ById.usecase';

// Repository binding
import { {Entity}Repository } from './applications/ports/{Entity}.repository';
import { {Entity}TypeormRepository } from './adapters/outbounds/{Entity}.typeorm.repository';

@Module({
  controllers: [{Entity}Controller],
  providers: [
    // Use Cases
    Create{Entity}UseCase,
    Delete{Entity}ByIdUseCase,
    GetAll{Entity}sUseCase,
    Get{Entity}ByIdUseCase,
    Update{Entity}ByIdUseCase,

    // Repository binding
    {
      provide: {Entity}Repository,
      useClass: {Entity}TypeormRepository,
    },
  ],
  exports: [
    // Export use cases if needed by other modules
    Create{Entity}UseCase,
    Get{Entity}ByIdUseCase,
    GetAll{Entity}sUseCase,
  ],
})
export class {MODULE_NAME}Module {}
```

## 🗄️ Database Migration

### Migration Creation
```bash
# Create empty migration
pnpm run migration:create -- src/databases/migrations/Create{Entity}Table

# Generate migration from Entity changes
pnpm run migration:generate -- --name=Create{Entity}Table

# Run migrations
pnpm run migration:run

# Revert migration
pnpm run migration:revert

# Show migration status
pnpm run migration:show

# Check database status
pnpm run db:status
```

### Migration File Naming Convention
```
{timestamp}-{description}.ts
Example: 1756391900904-CreatePostsTable.ts
```

### Migration Template Structure (Index Optimized)
```typescript
import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class Create{Entity}Table{timestamp} implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: '{entity}s',
        columns: [
          {
            name: 'uuid',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'active'",
          },
          {
            name: 'priority',
            type: 'int',
            default: 0,
          },
          // Add your columns here with proper types and constraints
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // ✅ OPTIMIZED INDEXES - Based on actual query patterns
    
    // Filter index for status column
    await queryRunner.createIndex(
      '{entity}s',
      new TableIndex({
        name: 'IDX_{Entity}_STATUS',
        columnNames: ['status'],
      }),
    );

    // Composite index for most common query: WHERE status ORDER BY priority
    await queryRunner.createIndex(
      '{entity}s',
      new TableIndex({
        name: 'IDX_{Entity}_STATUS_PRIORITY',
        columnNames: ['status', 'priority'],  // ✅ Covers priority queries too!
      }),
    );

    // Sorting index
    await queryRunner.createIndex(
      '{entity}s',
      new TableIndex({
        name: 'IDX_{Entity}_CREATED_AT',
        columnNames: ['createdAt'],
      }),
    );

    // ❌ DON'T CREATE: IDX_{Entity}_PRIORITY
    // Reason: Composite (status, priority) already covers priority queries
    // This would be redundant!
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes first (in reverse order)
    await queryRunner.dropIndex('{entity}s', 'IDX_{Entity}_STATUS');
    await queryRunner.dropIndex('{entity}s', 'IDX_{Entity}_STATUS_PRIORITY');
    await queryRunner.dropIndex('{entity}s', 'IDX_{Entity}_CREATED_AT');
    // Note: No need to drop IDX_{Entity}_PRIORITY (never created)

    // Drop table
    await queryRunner.dropTable('{entity}s');
  }
}
```

### Migration Best Practices
1. **Always use proper column types**: `varchar(length)`, `text`, `decimal(precision, scale)`
2. **Add indexes** for frequently queried columns (foreign keys, search fields, dates)
3. **Use proper constraints**: `isNullable`, `isUnique`, `default` values
4. **Include rollback logic** in `down()` method
5. **Test migrations** in development before applying to production
6. **Use meaningful names** for indexes and foreign keys

### ⚠️ Index Optimization Workflow (CRITICAL STEPS)

**MANDATORY: Review indexes BEFORE running migration:**

#### Phase 8: Create Migration (DON'T RUN YET!)
```bash
# Create migration file
pnpm run migration:create -- src/databases/migrations/Create{Entity}Table

# Add table and indexes to migration file
# DON'T run migration yet!
```

#### Phase 9: Index Optimization Review (MANDATORY)
**Follow `ai-index-optimization-spec.md` guidelines:**

1. **Analyze Query Patterns**
   - Review repository implementation for common queries
   - Identify WHERE, ORDER BY, JOIN patterns
   - Document expected query frequency

2. **Check for Composite Coverage**
   - If you have composite index `(A, B)` → DON'T create index `(A)`
   - Composite leading column covers single-column queries
   - **Example:** `(status, priority)` covers `WHERE status = '...'` queries

3. **Identify Redundant Indexes**
   ```typescript
   // ❌ REDUNDANT PATTERN:
   await queryRunner.createIndex('table', { columnNames: ['column_a'] });
   await queryRunner.createIndex('table', { columnNames: ['column_a', 'column_b'] });
   
   // ✅ OPTIMIZED:
   await queryRunner.createIndex('table', { columnNames: ['column_a', 'column_b'] });
   // Composite covers both queries!
   ```

4. **Apply Optimization Rules**
   - Remove redundant single-column indexes
   - Keep composite indexes that cover multiple patterns
   - Aim for 3-6 strategic indexes per table
   - Document each decision with comments

#### Phase 10: Update Migration File
```typescript
// Update migration with optimized indexes
// Add comments explaining optimization decisions
// Remove redundant index creation code
```

#### Phase 11: Run Migration
```bash
# Only after optimization is complete
pnpm run migration:run
```

> **📋 For comprehensive index guidelines**: See `docs/ai-specs/ai-index-optimization-spec.md`
> **📋 For migration guidelines**: See `docs/ai-specs/ai-migration-spec.md`

---

## 🎯 Index Optimization Workflow (Phases 8-11)

### Phase 8: Create Migration (DON'T RUN YET!)

```bash
# Create migration file
pnpm run migration:create -- src/databases/migrations/Create{Entity}Table

# Add table and indexes to migration file
# DON'T run migration yet!
```

### Phase 9: Index Optimization Review (MANDATORY)

**Follow `ai-index-optimization-spec.md` guidelines:**

#### Step 1: Analyze Query Patterns

Review repository implementation for common queries:

```typescript
// From repository implementation:
async getAll(params) {
  const qb = repo.createQueryBuilder('entity');
  
  // Pattern 1: Filter by status
  if (status) {
    qb.andWhere('entity.status = :status', { status });
  }
  
  // Pattern 2: Default sort
  qb.orderBy('entity.priority', 'DESC')
    .addOrderBy('entity.created_at', 'DESC');
    
  return qb.getMany();
}
```

**Identified Patterns:**
- ✅ `WHERE status = '...'` → Need index on `status`
- ✅ `ORDER BY priority DESC, created_at DESC` → Need index on `(priority)` or composite
- ✅ Combined: `WHERE status ORDER BY priority` → Composite `(status, priority)` perfect!

#### Step 2: Review Created Indexes

List all indexes from migration:

```typescript
// From your migration:
✅ IDX_TABLE_STATUS
✅ IDX_TABLE_PRIORITY
✅ IDX_TABLE_STATUS_PRIORITY
✅ IDX_TABLE_CREATED_AT
```

#### Step 3: Check Redundancy

Apply redundancy rules from `ai-index-optimization-spec.md`:

**Rule 1: Composite Covers Leading Column**
```typescript
Have: IDX_TABLE_STATUS_PRIORITY (status, priority)
Check: IDX_TABLE_PRIORITY ❌ REDUNDANT!
Reason: Queries on 'priority' can use composite index

Have: IDX_TABLE_STATUS_PRIORITY (status, priority)  
Check: IDX_TABLE_STATUS ✅ NEEDED
Reason: Composite doesn't cover 'status' alone efficiently... wait, it does!
       But we keep it for queries that ONLY filter by status (common pattern)
```

**Decision Matrix:**
| Index | Redundant? | Action | Reason |
|-------|-----------|--------|--------|
| `(status)` | ⚠️ Maybe | Keep if filtered alone often | Common filter |
| `(priority)` | ❌ YES | Remove | Covered by composite |
| `(status, priority)` | ✅ Keep | Core index | Most used pattern |
| `(created_at)` | ✅ Keep | Needed | Sorting |

### Phase 10: Update Migration File

**Update original migration to remove redundant indexes:**

```typescript
// ❌ DON'T CREATE: IDX_{Entity}_PRIORITY
// Reason: Composite (status, priority) already covers priority queries
// This would be redundant!

// ✅ OPTIMIZED INDEXES - Following ai-index-optimization-spec.md
await queryRunner.createIndex('{entity}s', new TableIndex({
  name: 'IDX_{Entity}_STATUS',
  columnNames: ['status'],
}));

await queryRunner.createIndex('{entity}s', new TableIndex({
  name: 'IDX_{Entity}_STATUS_PRIORITY',
  columnNames: ['status', 'priority'],  // Covers status queries too!
}));

await queryRunner.createIndex('{entity}s', new TableIndex({
  name: 'IDX_{Entity}_CREATED_AT',
  columnNames: ['created_at'],
}));
```

### Phase 11: Run Migration and Verify

```bash
# Only after optimization is complete
pnpm run migration:run

# Verify tests still pass
pnpm test {module}

# Build and verify
pnpm run build
```

### Real Examples from Project:

#### Example 1: Promotions
- **Found:** `IDX_PROMOTIONS_PRIORITY` redundant
- **Action:** Created `DropRedundantPromotionsPriorityIndex1759313081726.ts`
- **Result:** 7 → 6 indexes (14% improvement)

#### Example 2: Promotion Rules
- **Found:** `IDX_PROMOTION_RULES_PROMOTION_ID` redundant
- **Action:** Created `DropRedundantPromotionRulesPromotionIdIndex1759318853436.ts`
- **Result:** 4 → 3 indexes (25% improvement)

---

## 🧪 Testing Strategy

### Test Coverage Requirements
- [ ] **UseCase Tests**: 100% coverage with happy paths and error scenarios
- [ ] **Domain Tests**: Only if domain contains business methods
- [ ] **Repository Tests**: Integration tests for database operations
- [ ] **Controller Tests**: API endpoint validation
- [ ] **E2E Tests**: Complete user journey validation

### Test File Naming
- Domain: `{Entity}.domain.spec.ts`
- UseCase: `{operation}{Entity}.usecase.spec.ts`
- Repository: `{Entity}.typeorm.repository.spec.ts`
- Controller: `{Entity}.controller.spec.ts`

> **📋 For detailed testing patterns**: See `docs/ai-specs/unit-test-spec.md`

## 📝 HTTP Client Testing

#### HTTP Client Template (`{Entity}.http`)
```http
### Login
# @name login
POST {{host}}/auth/login
content-type: application/json
{
  "username": "user2",
  "password": "12345678"
}

@myAccessToken = {{login.response.body.accessToken}}

### Create {Entity}
POST {{host}}/{Entity}s
Content-Type: application/json
authorization: Bearer {{myAccessToken}}
{
  "name": "{Entity} new",
  "price": 100,
  "image": "https://example.com/image.jpg",
  "description": "This is a {Entity} description"
}

### Get All {Entity}s
GET {{host}}/{Entity}s
authorization: Bearer {{myAccessToken}}

### Get {Entity} By Id
GET {{host}}/{Entity}s/{{uuid}}
authorization: Bearer {{myAccessToken}}

### Update {Entity}
PUT {{host}}/{Entity}s/{{uuid}}
Content-Type: application/json
authorization: Bearer {{myAccessToken}}
{
  "name": "{Entity} updated",
  "price": 200,
  "description": "Updated description"
}

### Delete {Entity}
DELETE {{host}}/{Entity}s/{{uuid}}
authorization: Bearer {{myAccessToken}}
```

## ✅ Final Verification Checklist

### Code Quality
- [ ] Run `pnpm lint` - no linting errors
- [ ] Run `pnpm test` - all tests passing
- [ ] Run `pnpm test:cov` - 100% coverage on business logic
- [ ] Run `pnpm test:e2e` - integration tests passing

### Architecture Compliance
- [ ] Hexagonal architecture layers properly separated
- [ ] Dependency injection correctly configured
- [ ] Repository pattern implemented
- [ ] Use cases isolated from infrastructure
- [ ] Domain logic pure and testable

### API Documentation
- [ ] Swagger documentation complete
- [ ] DTOs properly validated
- [ ] Error handling implemented
- [ ] HTTP status codes correct
- [ ] Authentication guards applied

### Database
- [ ] Migration created and tested
- [ ] Entity mappings correct
- [ ] Indexes added for performance
- [ ] Rollback methods safe

### ⚠️ Index Optimization (MANDATORY - BEFORE MIGRATION)
- [ ] **Phase 8**: Create migration with indexes (DON'T RUN YET!)
- [ ] **Phase 9**: Review index redundancy using `ai-index-optimization-spec.md`
- [ ] **Phase 10**: Update migration file to remove redundant indexes
- [ ] **Phase 11**: Run migration with optimized indexes
- [ ] **No redundant single-column indexes** - Composite leading columns cover them
- [ ] **Optimal index count** - Aim for 3-6 strategic indexes per table
- [ ] **Document each index** - Comment why each index is needed
- [ ] **Performance verified** - Use EXPLAIN ANALYZE if possible
- [ ] **Foreign keys indexed** - Either single or composite with FK as leading column
- [ ] **Common patterns:**
  - ❌ Don't create `(A)` if you have `(A, B)` composite
  - ✅ Do create `(B)` even if you have `(A, B)` (trailing not covered)
  - ✅ Composite index count should be > single-column count for optimization

## 🚀 Module Registration

Add to `app.module.ts`:
```typescript
import { {MODULE_NAME}Module } from './{MODULE_NAME}/{MODULE_NAME}.module';

@Module({
  imports: [
    // ... existing imports
    {MODULE_NAME}Module,
  ],
})
export class AppModule {}
```

## 💡 Best Practices

### Code Quality
- Use `Builder<T>()` pattern instead of object literals
- Avoid spread operator `...` - prefer explicit fields
- Never use `any` - use precise types or `unknown`
- Follow AAA testing pattern: Arrange, Act, Assert

### Performance
- Add database indexes for frequently queried fields
- Implement pagination for list endpoints
- Use caching for read-heavy operations

### Security
- Validate all inputs with class-validator
- Implement proper authorization checks
- Sanitize output data
- Use JWT authentication guards

### Index Optimization (New Modules)
- **Always review indexes** after creating migration
- **Check redundancy** using `ai-index-optimization-spec.md`
- **Remove redundant indexes** via cleanup migration
- **Document decisions** in migration comments
- **Target:** 3-6 strategic indexes per table

---

## 🎓 Index Optimization Examples

### Example: Promotions Module
```typescript
// Initial migration created 7 indexes
// After review: Found IDX_PROMOTIONS_PRIORITY redundant
// Action: Created DropRedundantPromotionsPriorityIndex migration
// Result: 7 → 6 indexes (14% improvement)
```

### Example: Promotion Rules Module
```typescript
// Initial migration created 4 indexes
// After review: Found IDX_PROMOTION_RULES_PROMOTION_ID redundant
// Action: Created DropRedundantPromotionRulesPromotionIdIndex migration
// Result: 4 → 3 indexes (25% improvement)
```

### Common Redundancy Pattern:
```diff
- IDX_TABLE_COLUMN_A              ❌ Remove (redundant)
+ IDX_TABLE_COLUMN_B              ✅ Keep (needed)
+ IDX_TABLE_A_B                   ✅ Keep (composite covers A)
+ IDX_TABLE_CREATED_AT            ✅ Keep (sorting)
```

---

**🎯 Remember**: This template ensures consistency across all modules while maintaining hexagonal architecture principles. **ALWAYS perform index optimization (Phase 8)** before considering module complete. Adapt patterns to fit your specific domain requirements while keeping the core structure intact.
