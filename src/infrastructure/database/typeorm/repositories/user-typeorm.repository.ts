import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../../../domain/entities/user.entity';
import { UserRepository } from '../../../../domain/repositories/user.repository';
import { UserSchema } from '../entities/user.schema';
import { RoleSchema } from '../entities/role.schema';

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserSchema)
    private readonly ormRepository: Repository<UserSchema>,
  ) {}

  async findById(id: string): Promise<UserEntity | null> {
    const userSchema = await this.ormRepository.findOne({ where: { id }, relations: ['roles', 'roles.permissions'] });
    return userSchema ? this.mapSchemaToEntity(userSchema) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const userSchema = await this.ormRepository.findOne({ where: { email }, relations: ['roles', 'roles.permissions'] });
    return userSchema ? this.mapSchemaToEntity(userSchema) : null;
  }

  async save(user: UserEntity): Promise<UserEntity> {
    const userSchema = this.mapEntityToSchema(user);
    const savedSchema = await this.ormRepository.save(userSchema);
    return this.mapSchemaToEntity(savedSchema);
  }

  async findAllWithRoles(): Promise<UserEntity[]> {
    const userSchemas = await this.ormRepository.find({ relations: ['roles', 'roles.permissions'] });
    return userSchemas.map(this.mapSchemaToEntity);
  }

  private mapSchemaToEntity(schema: UserSchema): UserEntity {
    const entity = new UserEntity();
    entity.id = schema.id;
    entity.name = schema.name;
    entity.email = schema.email;
    entity.passwordHash = schema.passwordHash;
    entity.createdAt = schema.createdAt;
    entity.updatedAt = schema.updatedAt;
    entity.roles = schema.roles ? schema.roles.map(roleSchema => {
      const roleEntity = new (require('../../../../domain/entities/role.entity').RoleEntity)();
      roleEntity.id = roleSchema.id;
      roleEntity.name = roleSchema.name;
      roleEntity.createdAt = roleSchema.createdAt;
      roleEntity.updatedAt = roleSchema.updatedAt;
      roleEntity.permissions = roleSchema.permissions ? roleSchema.permissions.map(permSchema => {
          const permEntity = new (require('../../../../domain/entities/permission.entity').PermissionEntity)();
          permEntity.id = permSchema.id;
          permEntity.name = permSchema.name;
          return permEntity;
      }) : [];
      return roleEntity;
    }) : [];
    return entity;
  }

  private mapEntityToSchema(entity: UserEntity): UserSchema {
    const schema = new UserSchema();
    schema.id = entity.id;
    schema.name = entity.name;
    schema.email = entity.email;
    schema.passwordHash = entity.passwordHash;
    schema.createdAt = entity.createdAt;
    schema.updatedAt = entity.updatedAt;
    schema.roles = entity.roles ? entity.roles.map(roleEntity => {
        const roleSchema = new RoleSchema();
        roleSchema.id = roleEntity.id;
        roleSchema.name = roleEntity.name;
        return roleSchema;
    }) : [];
    return schema;
  }
}
