#!/bin/bash

# Define a pasta raiz onde os templates serão criados
TEMPLATE_ROOT="tools/generate/templates"

echo "Criando estrutura de diretórios e preenchendo arquivos de template em: $TEMPLATE_ROOT"

# Opcional: Remova a linha abaixo se preferir NÃO limpar a pasta antes de criar
# rm -rf "$TEMPLATE_ROOT"

# Cria os diretórios base de template
mkdir -p "$TEMPLATE_ROOT/application/dtos"
mkdir -p "$TEMPLATE_ROOT/application/use-cases"
mkdir -p "$TEMPLATE_ROOT/domain/entities"
mkdir -p "$TEMPLATE_ROOT/domain/repositories"
mkdir -p "$TEMPLATE_ROOT/infrastructure/database/typeorm/entities"
mkdir -p "$TEMPLATE_ROOT/infrastructure/database/typeorm/repositories"
mkdir -p "$TEMPLATE_ROOT/infrastructure/http/controllers"


RESOURCE_NAME="__name__"
RESOURCES_NAME="__names__"

# --------------------------------------------------------------------------
# Arquivo: __name__.module.ts.hbs
# Caminho de destino: src/application/modules/__name__/__name__.module.ts
# Imports de Libs: ../../../../../libs/ddd/... (5x ../)
# Imports de outras camadas do próprio módulo: './application/..., './domain/..., './infrastructure/...'
# --------------------------------------------------------------------------
cat <<EOL > "$TEMPLATE_ROOT/$RESOURCE_NAME.module.ts.hbs"
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

// CONTROLLERS (dentro do módulo)
import { __Name__Controller } from './infrastructure/http/controllers/__name__.controller';

// REPOSITORIES (Domain Port & Infrastructure Implementation, dentro do módulo)
import { __Name__Repository } from './domain/repositories/__name__.repository';
import { __Name__TypeormRepository } from './infrastructure/database/typeorm/repositories/__name__-typeorm.repository';
import { __Name__Schema } from './infrastructure/database/typeorm/entities/__name__.schema';

// USE CASES (Command & Query Handlers, dentro do módulo)
import { Create__Name__UseCase } from './application/use-cases/create-__name__.use-case';
import { FindAll__Names__UseCase } from './application/use-cases/find-all-__names__.use-case';
import { Get__Name__ByIdUseCase } from './application/use-cases/get-__name__-by-id.use-case';

// Libs do Nest-DDD-Hex-Base (Ajustado para alcançar 'libs/' de dentro de 'src/application/modules/__name__/')
import { UnitOfWork } from '../../../../../libs/ddd/domain/base-classes/unit-of-work'; // Corrigido path
import { ExceptionHelper } from '../../../../../libs/ddd/exception-helper'; // Corrigido path (assumindo libs/ddd/exception-helper.ts)

const useCases = [
  Create__Name__UseCase,
  FindAll__Names__UseCase,
  Get__Name__ByIdUseCase,
];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([__Name__Schema])],
  controllers: [__Name__Controller],
  providers: [
    ...useCases,
    UnitOfWork,
    ExceptionHelper,
    {
      provide: __Name__Repository,
      useClass: __Name__TypeormRepository,
    },
  ],
  exports: [
    __Name__Repository,
    UnitOfWork,
  ],
})
export class __Name__Module {}
EOL

# --------------------------------------------------------------------------
# Arquivo: application/dtos/create-__name__.dto.ts.hbs
# Caminho de destino: src/application/modules/__name__/application/dtos/create-__name__.dto.ts
# Imports de Libs: não tem neste
# --------------------------------------------------------------------------
cat <<EOL > "$TEMPLATE_ROOT/application/dtos/create-$RESOURCE_NAME.dto.ts.hbs"
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class Create__Name__Dto {
  @ApiProperty({ example: 'My New Item', description: 'Name of the item', minLength: 3, maxLength: 50 })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  readonly name: string;

  @ApiProperty({ example: 'Some detailed description.', description: 'Description of the item', required: false, maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  readonly description?: string;
}
EOL

# --------------------------------------------------------------------------
# Arquivo: application/dtos/__name__.dto.ts.hbs
# Caminho de destino: src/application/modules/__name__/application/dtos/__name__.dto.ts
# Imports de Libs: não tem neste
# --------------------------------------------------------------------------
cat <<EOL > "$TEMPLATE_ROOT/application/dtos/$RESOURCE_NAME.dto.ts.hbs"
import { ApiProperty } from '@nestjs/swagger';

export class __Name__Dto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'Unique ID of the item' })
  readonly id: string;

  @ApiProperty({ example: 'My New Item', description: 'Name of the item' })
  readonly name: string;

  @ApiProperty({ example: 'Some detailed description.', description: 'Description of the item', required: false })
  readonly description?: string;

  @ApiProperty({ example: '2023-10-26T10:00:00.000Z', description: 'Creation date in ISO 8601 format' })
  readonly createdAt: Date;

  @ApiProperty({ example: '2023-10-26T11:30:00.000Z', description: 'Last update date in ISO 8601 format' })
  readonly updatedAt: Date;

  constructor(props: Partial<__Name__Dto>) {
    Object.assign(this, props);
  }
}
EOL

# --------------------------------------------------------------------------
# Arquivo: application/use-cases/create-__name__.use-case.ts.hbs
# Caminho de destino: src/application/modules/__name__/application/use-cases/create-__name__.use-case.ts
# Imports de Libs: ../../../../../../libs/ddd/... (6x ../)
# Imports internos: ../dtos, ../../domain/entities, ../../domain/repositories (a partir de application/use-cases)
# --------------------------------------------------------------------------
cat <<EOL > "$TEMPLATE_ROOT/application/use-cases/create-$RESOURCE_NAME.use-case.ts.hbs"
import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Create__Name__Dto } from '../dtos/create-__name__.dto';
import { __Name__Entity } from '../../domain/entities/__name__.entity';
import { __Name__Repository } from '../../domain/repositories/__name__.repository';
import { UnitOfWork } from '../../../../../../libs/ddd/domain/base-classes/unit-of-work'; // Corrigido path

@CommandHandler(Create__Name__Dto)
export class Create__Name__UseCase implements ICommandHandler<Create__Name__Dto, string> {
  constructor(
    @Inject(__Name__Repository)
    private readonly __name__Repository: __Name__Repository,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  async execute(command: Create__Name__Dto): Promise<string> {
    const { name, description } = command;

    const __name__ = __Name__Entity.create({ name, description });

    await this.unitOfWork.start();
    try {
      await this.__name__Repository.save(__name__);
      await this.unitOfWork.commit();
      return __name__.id.value;
    } catch (error) {
      await this.unitOfWork.rollback();
      throw error;
    }
  }
}
EOL

# --------------------------------------------------------------------------
# Arquivo: application/use-cases/find-all-__names__.use-case.ts.hbs
# Caminho de destino: src/application/modules/__name__/application/use-cases/find-all-__names__.use-case.ts
# Imports de Libs: ../../../../../../libs/ddd/... (6x ../)
# Imports internos: ../dtos, ../../domain/repositories
# --------------------------------------------------------------------------
cat <<EOL > "$TEMPLATE_ROOT/application/use-cases/find-all-$RESOURCES_NAME.use-case.ts.hbs"
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Inject } from '@nestjs/common';
import { __Name__Repository } from '../../domain/repositories/__name__.repository';
import { __Name__Dto } from '../dtos/__name__.dto';

export class FindAll__Names__Query {
  @ApiPropertyOptional({ description: 'Number of items to skip for pagination' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  readonly skip?: number;

  @ApiPropertyOptional({ description: 'Number of items to take for pagination' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  readonly take?: number;

  constructor(props: Partial<FindAll__Names__Query>) {
    Object.assign(this, props);
  }
}

@QueryHandler(FindAll__Names__Query)
export class FindAll__Names__UseCase implements IQueryHandler<FindAll__Names__Query, __Name__Dto[]> {
  constructor(
    @Inject(__Name__Repository)
    private readonly __name__Repository: __name__Repository,
  ) {}

  async execute(query: FindAll__Names__Query): Promise<__Name__Dto[]> {
    const { skip, take } = query;
    const __names__ = await this.__name__Repository.findAll(skip, take);

    return __names__.map((__name__) => new __Name__Dto({
      id: __name__.id.value,
      name: __name__.name,
      description: __name__.description,
      createdAt: __name__.createdAt,
      updatedAt: __name__.updatedAt,
    }));
  }
}
EOL

# --------------------------------------------------------------------------
# Arquivo: application/use-cases/get-__name__-by-id.use-case.ts.hbs
# Caminho de destino: src/application/modules/__name__/application/use-cases/get-__name__-by-id.use-case.ts
# Imports de Libs: ../../../../../../libs/ddd/... (6x ../)
# Imports internos: ../dtos, ../../domain/repositories
# --------------------------------------------------------------------------
cat <<EOL > "$TEMPLATE_ROOT/application/use-cases/get-$RESOURCE_NAME-by-id.use-case.ts.hbs"
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { IsUUID, IsDefined } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { __Name__Repository } from '../../domain/repositories/__name__.repository';
import { __Name__Dto } from '../dtos/__name__.dto';

export class Get__Name__ByIdQuery {
  @ApiProperty({ description: 'ID of the __name__ to retrieve' })
  @IsUUID()
  @IsDefined()
  readonly id: string;

  constructor(id: string) {
    this.id = id;
  }
}

@QueryHandler(Get__Name__ByIdQuery)
export class Get__Name__ByIdUseCase implements IQueryHandler<Get__Name__ByIdQuery, __Name__Dto> {
  constructor(
    @Inject(__Name__Repository)
    private readonly __name__Repository: __name__Repository,
  ) {}

  async execute(query: Get__Name__ByIdQuery): Promise<__Name__Dto> {
    const { id } = query;
    const __name__ = await this.__name__Repository.findById(id);

    if (!__name__) {
      throw new NotFoundException(\`__Name__ with ID '\${id}' not found.\`);
    }

    return new __Name__Dto({
      id: __name__.id.value,
      name: __name__.name,
      description: __name__.description,
      createdAt: __name__.createdAt,
      updatedAt: __name__.updatedAt,
    });
  }
}
EOL

# --------------------------------------------------------------------------
# Arquivo: domain/entities/__name__.entity.ts.hbs
# Caminho de destino: src/application/modules/__name__/domain/entities/__name__.entity.ts
# Imports de Libs: ../../../../../../libs/ddd/... (6x ../)
# --------------------------------------------------------------------------
cat <<EOL > "$TEMPLATE_ROOT/domain/entities/$RESOURCE_NAME.entity.ts.hbs"
import { AggregateRoot } from '../../../../../../libs/ddd/domain/base-classes/aggregate-root.base'; // Corrigido path
import { Uuid } from '../../../../../../libs/ddd/domain/value-objects/uuid.value-object'; // Corrigido path
import { DomainEvent } from '../../../../../../libs/ddd/domain/domain-events/domain-event'; // Corrigido path

export class __Name__CreatedDomainEvent extends DomainEvent {
  constructor(props: Omit<__Name__CreatedDomainEvent, 'correlationId' | 'id' | 'createdAt' | 'entityId'>) {
    super(props);
  }
}

export interface Create__Name__Props {
  name: string;
  description?: string;
}

export class __Name__Entity extends AggregateRoot<Create__Name__Props> {
  name: string;
  description?: string;

  constructor(props: Create__Name__Props, id?: Uuid) {
    super(props, id);
    this.name = props.name;
    this.description = props.description;
  }

  static create(props: Create__Name__Props): __Name__Entity {
    const __name__ = new __Name__Entity(props);
    __name__.addEvent(
      new __Name__CreatedDomainEvent({
        aggregateId: __name__.id.value,
        name: __name__.name,
      }),
    );
    return __name__;
  }
}
EOL

# --------------------------------------------------------------------------
# Arquivo: domain/repositories/__name__.repository.ts.hbs
# Caminho de destino: src/application/modules/__name__/domain/repositories/__name__.repository.ts
# Imports de Libs: ../../../../../../libs/ddd/... (6x ../)
# Imports internos: ../entities (entity)
# --------------------------------------------------------------------------
cat <<EOL > "$TEMPLATE_ROOT/domain/repositories/$RESOURCE_NAME.repository.ts.hbs"
import { __Name__Entity } from '../entities/__name__.entity';
import { BaseRepositoryPort } from '../../../../../../libs/ddd/domain/ports/base-repository.port'; // Corrigido path

export abstract class __Name__Repository extends BaseRepositoryPort<__Name__Entity> {
  // abstract findByName(name: string): Promise<__Name__Entity | null>;
  // abstract findByCondition(condition: any): Promise<__Name__Entity[]>;
}
EOL

# --------------------------------------------------------------------------
# Arquivo: infrastructure/database/typeorm/entities/__name__.schema.ts.hbs
# Caminho de destino: src/application/modules/__name__/infrastructure/database/typeorm/entities/__name__.schema.ts
# Imports de Libs: ../../../../../../../../libs/ddd/... (8x ../)
# --------------------------------------------------------------------------
cat <<EOL > "$TEMPLATE_ROOT/infrastructure/database/typeorm/entities/$RESOURCE_NAME.schema.ts.hbs"
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseTypeormSchema } from '../../../../../../../../libs/ddd/infrastructure/database/base-classes/base-typeorm.schema'; // Corrigido path

@Entity('__names__')
export class __Name__Schema extends BaseTypeormSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;
}
EOL

# --------------------------------------------------------------------------
# Arquivo: infrastructure/database/typeorm/repositories/__name__-typeorm.repository.ts.hbs
# Caminho de destino: src/application/modules/__name__/infrastructure/database/typeorm/repositories/__name__-typeorm.repository.ts
# Imports de Libs: ../../../../../../../../libs/ddd/... (8x ../)
# Imports internos: ../entities (schema), ../../../domain/repositories (port), ../../../domain/entities (entity)
# --------------------------------------------------------------------------
cat <<EOL > "$TEMPLATE_ROOT/infrastructure/database/typeorm/repositories/$RESOURCE_NAME-typeorm.repository.ts.hbs"
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { __Name__Entity } from '../../../domain/entities/__name__.entity'; // Corrigido path
import { __Name__Schema } from '../entities/__name__.schema'; // Continua ..entities
import { __Name__Repository } from '../../../domain/repositories/__name__.repository'; // Corrigido path
import { BaseTypeormRepository } from '../../../../../../../../libs/ddd/infrastructure/database/base-classes/base-typeorm.repository'; // Corrigido path
import { Uuid } from '../../../../../../../../libs/ddd/domain/value-objects/uuid.value-object'; // Corrigido path
import { Mapper } from '../../../../../../../../libs/ddd/domain/mapper'; // Corrigido path

@Injectable()
export class __Name__TypeormRepository
  extends BaseTypeormRepository<__Name__Entity, __Name__Schema>
  implements __Name__Repository
{
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    super(dataSource.getRepository(__Name__Schema), new __Name__Mapper());
  }
}

class __Name__Mapper implements Mapper<__Name__Entity, __Name__Schema> {
  toDomain(schema: __Name__Schema): __Name__Entity {
    return new __Name__Entity(
      {
        name: schema.name,
        description: schema.description,
      },
      new Uuid(schema.id),
    );
  }

  toPersistence(entity: __Name__Entity): __Name__Schema {
    const schema = new __Name__Schema();
    schema.id = entity.id.value;
    schema.name = entity.name;
    schema.description = entity.description;
    schema.createdAt = entity.createdAt;
    schema.updatedAt = entity.updatedAt;
    return schema;
  }
}
EOL

# --------------------------------------------------------------------------
# Arquivo: infrastructure/http/controllers/__name__.controller.ts.hbs
# Caminho de destino: src/application/modules/__name__/infrastructure/http/controllers/__name__.controller.ts
# Imports de Libs: não tem neste (swagger já é global)
# Imports internos: ../../application/dtos, ../../application/use-cases
# --------------------------------------------------------------------------
cat <<EOL > "$TEMPLATE_ROOT/infrastructure/http/controllers/$RESOURCE_NAME.controller.ts.hbs"
import { Controller, Post, Body, Res, HttpStatus, Get, Param, Query as NestQuery } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiOkResponse, ApiNotFoundResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { Response } from 'express';

// DTOs (dentro do módulo)
import { Create__Name__Dto } from '../../application/dtos/create-__name__.dto';
import { __Name__Dto } from '../../application/dtos/__name__.dto';

// Use-Cases (que atuam como Handlers, dentro do módulo)
import { Create__Name__UseCase } from '../../application/use-cases/create-__name__.use-case';
import { FindAll__Names__Query, FindAll__Names__UseCase } from '../../application/use-cases/find-all-__names__.use-case';
import { Get__Name__ByIdQuery, Get__Name__ByIdUseCase } from '../../application/use-cases/get-__name__-by-id.use-case';

@ApiTags('__names__')
@Controller('__names__')
export class __Name__Controller {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new __name__' })
  @ApiCreatedResponse({ description: '__Name__ successfully created', type: __Name__Dto })
  async create__Name__(@Body() body: Create__Name__Dto, @Res() res: Response) {
    const __name__Id = await this.commandBus.execute(body);

    const created__name__ = new __Name__Dto({
      id: __name__Id,
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    res.status(HttpStatus.CREATED).json(created__name__);
  }

  @Get()
  @ApiOperation({ summary: 'Get a list of all __names__' })
  @ApiOkResponse({ description: 'List of __names__ retrieved successfully', type: [__Name__Dto] })
  async findAll__Names__(\@NestQuery() query: FindAll__Names__Query): Promise<__Name__Dto[]> {
    return this.queryBus.execute(new FindAll__Names__Query(query));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a __name__ by its ID' })
  @ApiOkResponse({ description: '__Name__ retrieved successfully', type: __Name__Dto })
  @ApiNotFoundResponse({ description: '__Name__ not found' })
  async get__Name__ById(\@Param('id') id: string): Promise<__Name__Dto> {
    return this.queryBus.execute(new Get__Name__ByIdQuery(id));
  }
}
EOL

echo "Estrutura de templates criada e preenchida com sucesso com paths CORRIGIDOS para a nova estrutura de src!"