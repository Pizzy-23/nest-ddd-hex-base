import { UserEntity } from '@domain/entities/user.entity';
import { UserRepository } from '@domain/repositories/user.repository';
import { TypeOrmUserRepository } from '@infra/database/typeorm/repositories/user-typeorm.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FindAllUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<UserEntity[]> {
    const users = await (
      this.userRepository as TypeOrmUserRepository
    ).findAllWithRoles();
    return users;
  }
}
