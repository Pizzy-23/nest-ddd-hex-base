#!/bin/bash

# Define a pasta raiz onde os templates serão criados
TEMPLATE_ROOT="tools/generate/templates"

echo "Criando estrutura de diretórios e preenchendo arquivos de template em: $TEMPLATE_ROOT"

# Limpa a estrutura existente para garantir uma nova criação limpa.
# **Importante:** Comente ou remova esta linha SE você tiver feito alterações manuais
# nos seus templates e NÃO quiser perdê-las ao rodar este script novamente.
rm -rf "$TEMPLATE_ROOT"

# Cria a estrutura de diretórios base DENTRO de templates/,
# espelhando como os arquivos serão organizados em src/
mkdir -p "$TEMPLATE_ROOT/application-dtos-in-module"
mkdir -p "$TEMPLATE_ROOT/application-modules-file" # Para o *.module.ts
mkdir -p "$TEMPLATE_ROOT/application-use-cases-in-module"
mkdir -p "$TEMPLATE_ROOT/domain-entities"
mkdir -p "$TEMPLATE_ROOT/domain-repositories"
mkdir -p "$TEMPLATE_ROOT/infrastructure-database-typeorm-entities"
mkdir -p "$TEMPLATE_ROOT/infrastructure-database-typeorm-repositories"
mkdir -p "$TEMPLATE_ROOT/infrastructure-http-controllers"


RESOURCE_NAME="__name__"
RESOURCES_NAME="__names__"


# =========================================================================
# === Templates para src/application/modules/__name__/*.module.ts (FICAM AQUI!)
# =========================================================================

# --------------------------------------------------------------------------
# Template: application-modules-file/__name__.module.ts.hbs
# Destino final: src/application/modules/__name__/__name__.module.ts
# --------------------------------------------------------------------------
cat <<EOL > "$TEMPLATE_ROOT/application-modules-file/$RESOURCE_NAME.module.ts.hbs"
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

// CONTROLLERS (GLOBAL)
import { __Name__Controller } from '@infra/http/controllers/__name__.controller'; 

// REPOSITORIES (Domain Port & Infrastructure Implementation, GLOBAIS)
import { __Name__Repository } from '@domain/repositories/__name__.repository'; 
import { __Name__TypeormRepository } from '@infra/database/typeorm/repositories/__name__-typeorm.repository'; 
import { __Name__Schema } from '@infra/database/typeorm/entities/__name__.schema'; 

// USE CASES (Serão injetados nos controllers, DENTRO do MÓDULO, não global)
import { Create__Name__UseCase } from './use-cases/create-__name__.use-case'; 
import { FindAll__Names__UseCase } from './use-cases/find-all-__names__.use-case'; 
import { Get__Name__ByIdUseCase } from './use-cases/get-__name__-by-id.use-case'; 

// Outros
import { UnitOfWork } from '@src/libs/ddd/domain/base-classes/unit-of-work'; 
import { ExceptionHelper } from '@src/libs/ddd/exception-helper'; 

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


# =========================================================================
# === Templates para src/application/modules/__name__/dtos/ (FICAM AQUI!)
# =========================================================================

# --------------------------------------------------------------------------
# Template: application-dtos-in-module/create-__name__.dto.ts.hbs
# Destino final: src/application/modules/__name__/dtos/create-__name__.dto.ts
# Imports: Nenhum (validação NestJS/Swagger é global)
# --------------------------------------------------------------------------
cat <<EOL > "$TEMPLATE_ROOT/application-dtos-in-module/create-$RESOURCE_NAME.dto.ts.hbs"
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
# Template: application-dtos-in-module/__name__.dto.ts.hbs
# Destino final: src/application/modules/__name__/dtos/__name__.dto.ts
# Imports: Nenhum (validação NestJS/Swagger é global)
# --------------------------------------------------------------------------
cat <<EOL > "$TEMPLATE_ROOT/application-dtos-in-module/$RESOURCE_NAME.dto.ts.hbs"
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


# =========================================================================
# === Templates para src/application/modules/__name__/use-cases/ (FICAM AQUI!)
# =========================================================================

# --------------------------------------------------------------------------
# Template: application-use-cases-in-module/create-__name__.use-case.ts.hbs
# Destino final: src/application/modules/__name__/use-cases/create-__name__.use-case.ts
# --------------------------------------------------------------------------
cat <<EOL > "$TEMPLATE_ROOT/application-use-cases-in-module/create-$RESOURCE_NAME.use-case.ts.hbs"
import { Injectable, ConflictException } from '@nestjs/common';
import { Create__Name__Dto } from '../dtos/create-__name__.dto'; // Relativo a ..dtos
import { __Name__Entity } from '@domain/entities/__name__.entity'; // Alias para global domain entities
import { __Name__Repository } from '@domain/repositories/__name__.repository'; // Alias para global domain repositories
import { UnitOfWork } from '@src/libs/ddd/domain/base-classes/unit-of-work'; // Alias para libs
// Assumindo RoleEnum ou outro enum em @domain/constants
// import { RoleEnum } from '@domain/constants/roles.enum'; 
// import { EncryptionUtil } from '@infra/common/utils/encryption.util'; 

@Injectable()
export class Create__Name__UseCase {
  constructor(
    private readonly __name__Repository: __Name__Repository,
    private readonly unitOfWork: UnitOfWork, // Use UnitOfWork se for usado na BaseRepository ou Service.
    // Se o Create UseCase tiver lógica complexa e outros repos/services, injete aqui.
    // private readonly otherService: OtherService, 
    // private readonly roleRepository: RoleRepository,
  ) {}

  async execute(
    dto: Create__Name__Dto,
    // Adicione argumentos opcionais ou obrigatórios aqui, ex: assignRole?: RoleEnum,
  ): Promise<__Name__Entity> { 
    // Exemplo de lógica com UnitOfWork, conflito e entidade
    // const existing__name__ = await this.__name__Repository.findByName(dto.name);
    // if (existing__name__) {
    //   throw new ConflictException('Item com este nome já existe.');
    // }

    // Cria a entidade
    const __name__ = __Name__Entity.create({ 
      name: dto.name, 
      description: dto.description,
      // outros campos
    });

    await this.unitOfWork.start();
    try {
      // Salva a entidade
      const saved__name__ = await this.__name__Repository.save(__name__);
      await this.unitOfWork.commit();
      return saved__name__; 
    } catch (error) {
      await this.unitOfWork.rollback();
      throw error;
    }
  }
}
EOL

# --------------------------------------------------------------------------
# Template: application-use-cases-in-module/find-all-__names__.use-case.ts.hbs
# Destino final: src/application/modules/__name__/use-cases/find-all-__names__.use-case.ts
# --------------------------------------------------------------------------
cat <<EOL > "$TEMPLATE_ROOT/application-use-cases-in-module/find-all-$RESOURCES_NAME.use-case.ts.hbs"
import { Injectable } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { __Name__Repository } from '@domain/repositories/__name__.repository'; 
import { __Name__Dto } from '../dtos/__name__.dto'; // Relativo a ..dtos

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

@Injectable()
export class FindAll__Names__UseCase { 
  constructor(
    private readonly __name__Repository: __Name__Repository,
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
# Template: application-use-cases-in-module/get-__name__-by-id.use-case.ts.hbs
# Destino final: src/application/modules/__name__/use-cases/get-__name__-by-id.use-case.ts
# --------------------------------------------------------------------------
cat <<EOL > "$TEMPLATE_ROOT/application-use-cases-in-module/get-$RESOURCE_NAME-by-id.use-case.ts.hbs"
import { Injectable, NotFoundException } from '@nestjs/common';
import { IsUUID, IsDefined } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { __Name__Repository } from '@domain/repositories/__name__.repository'; 
import { __Name__Dto } from '../dtos/__name__.dto'; // Relativo a ..dtos

export class Get__Name__ByIdQuery { 
  @ApiProperty({ description: 'ID of the __name__ to retrieve' })
  @IsUUID()
  @IsDefined()
  readonly id: string;

  constructor(id: string) {
    this.id = id;
  }
}

@Injectable()
export class Get__Name__ByIdUseCase { 
  constructor(
    private readonly __name__Repository: __Name__Repository,
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


# =========================================================================
# === Templates para src/domain/entities/ (GLOBAL)
# =========================================================================

# --------------------------------------------------------------------------
# Template: domain-entities/__name__.entity.ts.hbs
# Destino final: src/domain/entities/__name__.entity.ts
# --------------------------------------------------------------------------
cat <<EOL > "$TEMPLATE_ROOT/domain-entities/$RESOURCE_NAME.entity.ts.hbs"
import { BaseEntity } from './base-entity'; // Sua BaseEntity em src/domain/entities/
import { Uuid } from '@src/libs/ddd/domain/value-objects/uuid.value-object'; 
import { DomainEvent } from '@src/libs/ddd/domain/domain-events/domain-event'; 
// Assumindo RoleEntity ou outros entities relacionadas (com alias para o domain)
// import { RoleEntity } from '@domain/entities/role.entity';

// NOTA: BaseEntity deve extender AggregateRoot ou ser a sua raíz para Uuid, createdAt, etc.
// O AggregateRoot aqui é usado se BaseEntity não provê essas funcionalidades diretamente.
// Se BaseEntity já provê, esta entidade apenas estende BaseEntity e usa as propriedades herdadas.

export class __Name__CreatedDomainEvent extends DomainEvent {
  constructor(props: Omit<__Name__CreatedDomainEvent, 'correlationId' | 'id' | 'createdAt' | 'entityId'>) {
    super(props);
  }
}

export interface Create__Name__Props {
  name: string;
  description?: string;
}

export class __Name__Entity extends BaseEntity { // Alinhado com seu exemplo de UserEntity extends BaseEntity
  // Propriedades do seu TestEntity (como você as define)
  name: string;
  description?: string;
  // Exemplo para um 'UserEntity':
  // email: string;
  // passwordHash: string;
  // roles: RoleEntity[];

  constructor(props: Create__Name__Props, id?: string) { // Id é string agora para construtor de BaseEntity/TypeOrm
    super(); // Chama o construtor de BaseEntity
    if (id) { this.id = id; } // Se BaseEntity lida com o ID
    this.name = props.name;
    this.description = props.description;
  }

  static create(props: Create__Name__Props): __Name__Entity {
    const __name__ = new __Name__Entity(props);
    __name__.addEvent( // Método herdado de AggregateRoot ou BaseEntity, se BaseEntity o provê.
      new __Name__CreatedDomainEvent({
        aggregateId: __name__.id, // ID da entidade
        name: __name__.name,
      }),
    );
    return __name__;
  }

  // Se você tem um setter para o ID em BaseEntity
  setId(id: string): void {
      this.id = id;
  }
}
EOL


# =========================================================================
# === Templates para src/domain/repositories/ (GLOBAL)
# =========================================================================

# --------------------------------------------------------------------------
# Template: domain-repositories/__name__.repository.ts.hbs
# Destino final: src/domain/repositories/__name__.repository.ts
# --------------------------------------------------------------------------
cat <<EOL > "$TEMPLATE_ROOT/domain-repositories/$RESOURCE_NAME.repository.ts.hbs"
import { __Name__Entity } from '../entities/__name__.entity'; 
import { BaseRepository } from './base.repository'; 

export abstract class __Name__Repository extends BaseRepository<__Name__Entity> {
  // abstract findByEmail(email: string): Promise<__Name__Entity | null>; // Exemplo do User
  abstract findByName(name: string): Promise<__Name__Entity | null>; // Adicionado findByName, se sua entidade o usa.
  abstract findByCondition(condition: any): Promise<__Name__Entity[]>; // Adicionado findByCondition
}
EOL


# =========================================================================
# === Templates para src/infrastructure/database/typeorm/entities/ (GLOBAL)
# =========================================================================

# --------------------------------------------------------------------------
# Template: infrastructure-database-typeorm-entities/__name__.schema.ts.hbs
# Destino final: src/infrastructure/database/typeorm/entities/__name__.schema.ts
# --------------------------------------------------------------------------
cat <<EOL > "$TEMPLATE_ROOT/infrastructure-database-typeorm-entities/$RESOURCE_NAME.schema.ts.hbs"
import { Entity, Column } from 'typeorm'; // Importa apenas o necessário para seu schema
import { BaseTypeOrmSchema } from './base-typeorm.schema'; // Assumindo BaseTypeOrmSchema em src/infrastructure/database/typeorm/entities

@Entity('__names__')
export class __Name__Schema extends BaseTypeOrmSchema {
  @Column({ type: 'varchar', length: 50, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  // Add more fields here based on your entity properties
  // Ex: @Column({ type: 'varchar', unique: true, nullable: false })
  // email: string;
  // @Column({ type: 'varchar', nullable: false })
  // passwordHash: string;

  // Adicionar relações, se houver (muito comum, ex: para Role)
  // @ManyToOne(() => RoleSchema, role => role.users, { eager: true }) // Assumindo RoleSchema existe
  // roles: RoleSchema[];
}
EOL


# =========================================================================
# === Templates para src/infrastructure/database/typeorm/repositories/ (GLOBAL)
# =========================================================================

# --------------------------------------------------------------------------
# Template: infrastructure-database-typeorm-repositories/__name__-typeorm.repository.ts.hbs
# Destino final: src/infrastructure/database/typeorm/repositories/__name__-typeorm.repository.ts
# --------------------------------------------------------------------------
cat <<EOL > "$TEMPLATE_ROOT/infrastructure-database-typeorm-repositories/$RESOURCE_NAME-typeorm.repository.ts.hbs"
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'; // Use InjectRepository em vez de InjectDataSource se BaseTypeOrmRepository já usa
import { Repository, DeepPartial } from 'typeorm'; // Adicionado DeepPartial

import { __Name__Entity } from '@domain/entities/__name__.entity'; 
import { __Name__Repository } from '@domain/repositories/__name__.repository'; 
import { __Name__Schema } from '@infra/database/typeorm/entities/__name__.schema'; 
import { BaseTypeOrmRepository } from './base-typeorm.repository'; // Assumindo BaseTypeOrmRepository aqui.

// IMPORTAÇÕES PARA RELAÇÕES (COMENTADOS/EXEMPLOS)
// import { RoleEntity } from '@domain/entities/role.entity'; 
// import { PermissionEntity } from '@domain/entities/permission.entity'; 
// import { RoleSchema } from '@infra/database/typeorm/entities/role.schema'; 

@Injectable()
export class TypeOrm__Name__Repository
  extends BaseTypeOrmRepository<__Name__Entity, __Name__Schema>
  implements __Name__Repository {

  constructor(
    @InjectRepository(__Name__Schema)
    protected readonly ormRepository: Repository<__Name__Schema>,
  ) {
    super(ormRepository);
  }

  // MÉTODOS DE CONSULTA CUSTOMIZADOS (conforme o contrato __Name__Repository)
  async findByName(name: string): Promise<__Name__Entity | null> {
    const schema = await this.ormRepository.findOne({ 
      where: { name },
      // relations: ['roles', 'roles.permissions'], // Exemplo para entidades com relações
    });
    return schema ? this.mapSchemaToEntity(schema) : null;
  }

  async findByCondition(condition: any): Promise<__Name__Entity[]> {
    const schemas = await this.ormRepository.find({ 
      where: condition,
      // relations: ['roles', 'roles.permissions'],
    });
    return schemas.map(this.mapSchemaToEntity);
  }

  // ========================================================
  // === MAPPERS entre Schema e Entity (Baseado no seu exemplo de User) ===
  // ========================================================

  protected mapSchemaToEntity(schema: __Name__Schema): __Name__Entity {
    const entity = new __Name__Entity({ name: schema.name, description: schema.description });
    entity.id = schema.id; // Assume que BaseEntity/AggregateRoot tem um 'id' público ou setter
    entity.createdAt = schema.createdAt;
    entity.updatedAt = schema.updatedAt;

    // Lógica para mapear relações, se houver
    // Ex: entity.roles = schema.roles ? schema.roles.map((roleSchema) => { ... }) : [];

    return entity;
  }

  protected mapEntityToSchema(entity: __Name__Entity): __Name__Schema {
    const schema = new __Name__Schema();
    if (entity.id) schema.id = entity.id; // IDs devem ser definidos ao salvar novas entidades, senão TypeORM gera.
    schema.name = entity.name;
    schema.description = entity.description;

    // Lógica para mapear relações, se houver
    // Ex: schema.roles = entity.roles ? entity.roles.map((roleEntity) => { ... }) : [];

    return schema;
  }

  protected mapPartialEntityToSchema(partialEntity: Partial<__Name__Entity>): DeepPartial<__Name__Schema> {
    const partialSchema: DeepPartial<__Name__Schema> = {};
    if (partialEntity.name !== undefined) partialSchema.name = partialEntity.name;
    if (partialEntity.description !== undefined) partialSchema.description = partialEntity.description;

    // Lógica para mapear relações parciais
    // Ex: if (partialEntity.roles !== undefined) partialSchema.roles = partialEntity.roles.map(r => { ... });
    
    return partialSchema;
  }
}
EOL


# =========================================================================
# === Templates para src/infrastructure/http/controllers/ (GLOBAL)
# =========================================================================

# --------------------------------------------------------------------------
# Template: infrastructure-http-controllers/__name__.controller.ts.hbs
# Destino final: src/infrastructure/http/controllers/__name__.controller.ts
# --------------------------------------------------------------------------
cat <<EOL > "$TEMPLATE_ROOT/infrastructure-http-controllers/$RESOURCE_NAME.controller.ts.hbs"
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  // Removendo UseGuards e Roles (podem ser adicionados manualmente conforme o módulo global os define)
  // UseGuards, 
  // Res, 
  // HttpStatus,
  // Para Responses mais padronizadas, pode usar o Response da NestJS, ou o ResponseUtil.
} from '@nestjs/common';
import { Create__Name__Dto } from '@app/modules/__name__/dtos/create-__name__.dto'; 
import { __Name__Dto } from '@app/modules/__name__/dtos/__name__.dto'; 
import { Create__Name__UseCase } from '@app/modules/__name__/use-cases/create-__name__.use-case'; 
import { FindAll__Names__UseCase } from '@app/modules/__name__/use-cases/find-all-__names__.use-case'; 
import { Get__Name__ByIdUseCase } from '@app/modules/__name__/use-cases/get-__name__-by-id.use-case'; 

// IMPORTAÇÕES GLOBAIS COM ALIAS (RoleEnum, AuthGuard, ResponseUtil)
// import { AuthGuard } from '@app/modules/auth/guards/auth.guard'; 
// import { RolesGuard } from '@app/modules/auth/guards/roles.guard'; 
// import { Roles } from '@app/modules/auth/decorators/roles.decorator'; 
// import { RoleEnum } from '@domain/constants/roles.enum'; 
// import { Response } from 'express'; // Para usar express res diretamente
// import { ResponseUtil } from '@infra/common/utils/response.util'; 
// import { __Name__Entity } from '@domain/entities/__name__.entity'; // Importa a entidade de domínio global

@Controller('__names__')
// @UseGuards(AuthGuard, RolesGuard) // Descomente e ajuste conforme necessário para o módulo Auth
export class __Name__Controller {
  constructor(
    private readonly create__Name__UseCase: Create__Name__UseCase,
    private readonly findAll__Names__UseCase: FindAll__Names__UseCase,
    private readonly get__Name__ByIdUseCase: Get__Name__ByIdUseCase,
  ) {}

  private map__Name__EntityToDto(__name__: __Name__Entity): __Name__Dto {
    const __name__Dto = new __Name__Dto({ // Adapta para usar construtor do DTO se aplicável
      id: __name__.id,
      name: __name__.name,
      description: __name__.description,
      // outros campos da sua entidade
      // ex: roles: __name__.roles ? __name__.roles.map((role) => role.name) : [],
      createdAt: __name__.createdAt, // BaseEntity deve ter createdAt/updatedAt
      updatedAt: __name__.updatedAt,
    });
    return __name__Dto;
  }

  @Post()
  // @Roles(RoleEnum.ADMIN) // Descomente se Roles for usado globalmente
  async create(@Body() create__Name__Dto: Create__Name__Dto/*, @Res() res: Response*/) { // Adapte para o ResponseUtil
    const __name__Entity = await this.create__Name__UseCase.execute(create__Name__Dto);
    // Adapta para seu ResponseUtil ou para a resposta padrão NestJS
    // res.status(HttpStatus.CREATED).json(ResponseUtil.success(this.map__Name__EntityToDto(__name__Entity), '__Name__ created successfully.'));
    return this.map__Name__EntityToDto(__name__Entity); // Retorno padrão NestJS
  }

  @Get()
  // @Roles(RoleEnum.ADMIN, RoleEnum.USER) // Descomente se Roles for usado globalmente
  async findAll(/*@Res() res: Response*/) { // Adapte para o ResponseUtil
    const __names__ = await this.findAll__Names__UseCase.execute({}); // Adicione um objeto vazio ou o DTO de query se necessário
    // res.status(HttpStatus.OK).json(ResponseUtil.success(__names__.map(this.map__Name__EntityToDto), 'List of __names__ retrieved successfully.'));
    return __names__.map(this.map__Name__EntityToDto); // Retorno padrão NestJS
  }

  @Get(':id')
  // @Roles(RoleEnum.ADMIN, RoleEnum.USER) // Descomente se Roles for usado globalmente
  async findOne(@Param('id') id: string/*, @Res() res: Response*/) { // Adapte para o ResponseUtil
    const __name__Entity = await this.get__Name__ByIdUseCase.execute({ id }); // Passa ID como objeto
    // res.status(HttpStatus.OK).json(ResponseUtil.success(this.map__Name__EntityToDto(__name__Entity), '__Name__ retrieved successfully.'));
    return this.map__Name__EntityToDto(__name__Entity); // Retorno padrão NestJS
  }

  // EXEMPLOS ADICIONAIS DO SEU USER CONTROLLER (adicione se forem universais)
  // @Get('public/products')
  // @Roles(RoleEnum.VISITOR, RoleEnum.USER, RoleEnum.ADMIN)
  // getPublicProducts(@Res() res: Response) { /* ... */ }

  // @Post('admin/products')
  // @Roles(RoleEnum.ADMIN)
  // createProduct(@Res() res: Response) { /* ... */ }
}
EOL


echo "Estrutura de templates criada e preenchida com sucesso com ALIASES, INJECTABLE Use Cases e BaseRepository, e com o padrão híbrido de organização!"