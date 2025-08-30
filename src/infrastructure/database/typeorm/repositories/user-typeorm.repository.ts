import { PermissionEntity } from "@domain/entities/permission.entity";
import { RoleEntity } from "@domain/entities/role.entity";
import { UserEntity } from "@domain/entities/user.entity";
import { UserRepository } from "@domain/repositories/user.repository";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DeepPartial } from "typeorm";
import { RoleSchema } from "../entities/role.schema";
import { UserSchema } from "../entities/user.schema";
import { BaseTypeOrmRepository } from "./base-typeorm.repository";

@Injectable()
export class TypeOrmUserRepository
  extends BaseTypeOrmRepository<UserEntity, UserSchema>
  implements UserRepository {

  constructor(
    @InjectRepository(UserSchema)
    protected readonly ormRepository: Repository<UserSchema>,
  ) {
    super(ormRepository);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const userSchema = await this.ormRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions'],
    });
    return userSchema ? this.mapSchemaToEntity(userSchema) : null;
  }

  async findAllWithRoles(): Promise<UserEntity[]> {
    return this.findAll({ relations: ['roles', 'roles.permissions'] });
  }

  protected mapSchemaToEntity(schema: UserSchema): UserEntity {
    const entity = new UserEntity();
    entity.id = schema.id;
    entity.name = schema.name;
    entity.email = schema.email;
    entity.passwordHash = schema.passwordHash;
    entity.createdAt = schema.createdAt;
    entity.updatedAt = schema.updatedAt;
    entity.roles = schema.roles
      ? schema.roles.map((roleSchema) => {
          const roleEntity = new RoleEntity();
          roleEntity.id = roleSchema.id;
          roleEntity.name = roleSchema.name;
          roleEntity.createdAt = roleSchema.createdAt;
          roleEntity.updatedAt = roleSchema.updatedAt;
          roleEntity.permissions = roleSchema.permissions
            ? roleSchema.permissions.map((permSchema) => {
                const permEntity = new PermissionEntity();
                permEntity.id = permSchema.id;
                permEntity.name = permSchema.name;
                permEntity.createdAt = permSchema.createdAt;
                permEntity.updatedAt = permSchema.updatedAt;
                return permEntity;
              })
            : [];
          return roleEntity;
        })
      : [];
    return entity;
  }

  protected mapEntityToSchema(entity: UserEntity): UserSchema {
    const schema = new UserSchema();
    if (entity.id) schema.id = entity.id;
    schema.name = entity.name;
    schema.email = entity.email;
    schema.passwordHash = entity.passwordHash;
    if (entity.createdAt) schema.createdAt = entity.createdAt;
    if (entity.updatedAt) schema.updatedAt = entity.updatedAt;
    schema.roles = entity.roles
      ? entity.roles.map((roleEntity) => {
          const roleSchema = new RoleSchema();
          if (roleEntity.id) roleSchema.id = roleEntity.id;
          roleSchema.name = roleEntity.name;
          return roleSchema;
        })
      : [];
    return schema;
  }

  protected mapPartialEntityToSchema(partialEntity: Partial<UserEntity>): DeepPartial<UserSchema> {
    const partialSchema: DeepPartial<UserSchema> = {};
    if (partialEntity.name !== undefined) partialSchema.name = partialEntity.name;
    if (partialEntity.email !== undefined) partialSchema.email = partialEntity.email;
    if (partialEntity.passwordHash !== undefined) partialSchema.passwordHash = partialEntity.passwordHash;
    if (partialEntity.roles !== undefined) {
      partialSchema.roles = partialEntity.roles.map(r => {
        const roleSchema = new RoleSchema();
        if (r.id) roleSchema.id = r.id; 
        roleSchema.name = r.name;
        return roleSchema;
      });
    }
    return partialSchema;
  }
}