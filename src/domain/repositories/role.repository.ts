import { RoleEntity } from '../entities/role.entity';

export abstract class RoleRepository {
  abstract findByName(name: string): Promise<RoleEntity | null>;
  abstract save(role: RoleEntity): Promise<RoleEntity>;
  abstract findAll(): Promise<RoleEntity[]>;
}
