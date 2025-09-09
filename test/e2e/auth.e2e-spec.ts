// test/e2e/auth.e2e-spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createE2eTestingModule } from './utils/e2e-testing-module';
import { AppModule } from '../../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let adminAccessToken: string; 

  beforeAll(async () => {
    const moduleFixture: TestingModule = await createE2eTestingModule();
    app = moduleFixture.createNestApplication();
    await app.init();

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@example.com', password: 'password' })
      .expect(200);

    adminAccessToken = loginResponse.body.data.accessToken;
    expect(adminAccessToken).toBeDefined();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/v1/auth/login (POST) - login admin sucesso', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@example.com', password: 'password' })
      .expect(200);

    expect(response.body.message).toBe('Login successful.');
    expect(response.body.data.accessToken).toBeDefined();
  });

  it('/api/v1/auth/login (POST) - login falha com credenciais incorretas', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@example.com', password: 'wrongpassword' })
      .expect(401);

    expect(response.body.message).toBe('Invalid credentials.');
    expect(response.body.data).toBeUndefined();
  });

  it('/api/v1/users (GET) - deve retornar lista de usuários se autenticado', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${adminAccessToken}`) 
      .expect(200);

    expect(response.body.message).toBe('List of users retrieved successfully.');
    expect(Array.isArray(response.body.data)).toBeTruthy();
    expect(response.body.data.some((u: any) => u.email === 'admin@example.com')).toBeTruthy();
  });

  it('/api/v1/users (GET) - deve falhar se não autenticado', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/users')
      .expect(401);

    expect(response.body.message).toBe('Unauthorized');
  });
});