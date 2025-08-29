import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: './db.sqlite',
  entities: [path.join(__dirname, '../../database/typeorm/entities/*.{ts,js}')],
  synchronize: true,
  logging: true,
};
