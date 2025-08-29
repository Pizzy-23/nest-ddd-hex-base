import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleEntity } from '../../../../domain/entities/role.entity';
import { RoleRepository } from '../../../../domain/repositories/role.repository';
import { RoleSchema } from '../entities/role.schema';
import { PermissionEntity } from '../../../../domain/entities/permission.entity';

@Injectable()
export class TypeOrmRoleRepository implements RoleRepository {
  constructor(
    @InjectRepository(RoleSchema)
    private readonly ormRepository: Repository<RoleSchema>,
  ) {}

  async findById(id: string): Promise<RoleEntity | null> {
    const roleSchema = await this.ormRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
    return roleSchema ? this.mapSchemaToEntity(roleSchema) : null;
  }

  async findByName(name: string): Promise<RoleEntity | null> {
    const roleSchema = await this.ormRepository.findOne({
      where: { name },
      relations: ['permissions'],
    });
    return roleSchema ? this.mapSchemaToEntity(roleSchema) : null;
  }

  async save(role: RoleEntity): Promise<RoleEntity> {
    const roleSchema = this.mapEntityToSchema(role);
    const savedSchema = await this.ormRepository.save(roleSchema);
    return this.mapSchemaToEntity(savedSchema);
  }

  async delete(id: string): Promise<void> {
    const deleteResult = await this.ormRepository.delete(id);
    if (deleteResult.affected === 0) {
      throw new NotFoundException(`Role with ID "${id}" not found.`);
    }
  }

  async findAll(): Promise<RoleEntity[]> {
    const roleSchemas = await this.ormRepository.find({
      relations: ['permissions'],
    });
    return roleSchemas.map(this.mapSchemaToEntity);
  }

  async findAllWithPermissions(): Promise<RoleEntity[]> {
    return this.findAll();
  }

  private mapSchemaToEntity(schema: RoleSchema): RoleEntity {
    const entity = new RoleEntity();
    entity.id = schema.id;
    entity.name = schema.name;
    entity.createdAt = schema.createdAt;
    entity.updatedAt = schema.updatedAt;
    entity.permissions = schema.permissions
      ? schema.permissions.map((permSchema) => {
          const permEntity = new PermissionEntity();
          permEntity.id = permSchema.id;
          permEntity.name = permSchema.name;
          permEntity.createdAt = permSchema.createdAt;
          permEntity.updatedAt = permSchema.updatedAt;
          return permEntity;
        })
      : [];
    return entity;
  }

  private mapEntityToSchema(entity: RoleEntity): RoleSchema {
    const schema = new RoleSchema();
    if (entity.id) schema.id = entity.id;
    schema.name = entity.name;
    if (entity.createdAt) schema.createdAt = entity.createdAt;
    if (entity.updatedAt) schema.updatedAt = entity.updatedAt;

    schema.permissions = entity.permissions
      ? entity.permissions.map((permEntity) => {
          const permSchema =
            new (require('../entities/permission.schema').PermissionSchema)();
          if (permEntity.id) permSchema.id = permEntity.id;
          permSchema.name = permEntity.name;
          return permSchema;
        })
      : [];
    return schema;
  }
}
