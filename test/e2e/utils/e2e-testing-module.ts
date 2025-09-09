// test/e2e/utils/e2e-testing-module.ts

import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';


export async function createE2eTestingModule(): Promise<TestingModule> {
  const entitiesPath = [path.join(__dirname, '../../src/infrastructure/database/typeorm/entities/*.{ts,js}')];

  const testTypeOrmConfig: TypeOrmModuleOptions = {
    type: 'sqlite',
    database: ':memory:',
    entities: entitiesPath, 
    synchronize: true, 
    logging: false, 
  };

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(require('@nestjs/typeorm').TypeOrmModuleOptions)
    .useValue(testTypeOrmConfig)
    .compile();

  return moduleFixture;
}