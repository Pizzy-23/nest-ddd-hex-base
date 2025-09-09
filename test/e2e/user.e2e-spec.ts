// test/e2e/user.e2e-spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createE2eTestingModule } from './utils/e2e-testing-module';
import { AppModule } from '../../src/app.module';
import { LoginDto } from '../../src/application/modules/auth/dtos/login.dto';
import { CreateUserDto } from '../../src/application/modules/user/dtos/create-user.dto';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let adminAccessToken: string;
  let userAccessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await createE2eTestingModule();
    app = moduleFixture.createNestApplication();
    await app.init();

    const loginAdminDto: LoginDto = {
      email: 'admin@example.com',
      password: 'password',
    };
    const adminLoginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send(loginAdminDto)
      .expect(200);
    adminAccessToken = adminLoginResponse.body.data.accessToken;

    const newUserDto: CreateUserDto = {
      name: 'Normal User',
      email: 'user@example.com',
      password: 'password123',
    };
    await request(app.getHttpServer())
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send(newUserDto)
      .expect(201);

    const loginUserDto: LoginDto = {
      email: 'user@example.com',
      password: 'password123',
    };
    const userLoginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send(loginUserDto)
      .expect(200);
    userAccessToken = userLoginResponse.body.data.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/v1/users (POST) - Create User', () => {
    const createUserDto: CreateUserDto = {
      name: 'New Test User',
      email: 'newtest@example.com',
      password: 'securepassword',
    };

    it('deve criar um usuário com sucesso (ADMIN)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(createUserDto)
        .expect(201);

      expect(response.body.message).toBe('User created successfully.');
      expect(response.body.data.email).toBe(createUserDto.email);
      expect(response.body.data.roles).toContain('User');
    });

    it('deve falhar ao criar usuário com email duplicado (ADMIN)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(createUserDto)
        .expect(409);
    });

    it('deve falhar ao criar usuário se não for ADMIN (USER)', async () => {
      const anotherUserDto: CreateUserDto = {
        name: 'Another User',
        email: 'another@example.com',
        password: 'password',
      };
      await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(anotherUserDto)
        .expect(403);
    });

    it('deve falhar ao criar usuário se não autenticado', async () => {
      const anonymousUserDto: CreateUserDto = {
        name: 'Anonymous',
        email: 'anon@example.com',
        password: 'pass',
      };
      await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(anonymousUserDto)
        .expect(401);
    });
  });

  describe('/api/v1/users (GET) - Find All Users', () => {
    it('deve retornar todos os usuários (ADMIN)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(response.body.message).toBe(
        'List of users retrieved successfully.',
      );
      expect(Array.isArray(response.body.data)).toBeTruthy();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.some((u: any) => u.email === 'admin@example.com'),
      ).toBeTruthy();
      expect(
        response.body.data.some((u: any) => u.email === 'user@example.com'),
      ).toBeTruthy();
    });

    it('deve retornar todos os usuários (USER)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${userAccessToken}`) // Usuário comum pode listar
        .expect(200);

      expect(response.body.message).toBe(
        'List of users retrieved successfully.',
      );
      expect(Array.isArray(response.body.data)).toBeTruthy();
    });
  });

  describe('/api/v1/users/:id (GET) - Find User By ID', () => {
    let testUserId: string;

    beforeAll(async () => {
      // Cria um usuário para ser buscado por ID
      const dto: CreateUserDto = {
        name: 'Lookup User',
        email: 'lookup@example.com',
        password: 'password',
      };
      const creationResponse = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(dto)
        .expect(201);
      testUserId = creationResponse.body.data.id;
    });

    it('deve retornar o usuário pelo ID (ADMIN)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(response.body.message).toBe('User retrieved successfully.');
      expect(response.body.data.id).toBe(testUserId);
      expect(response.body.data.email).toBe('lookup@example.com');
    });

    it('deve retornar o usuário pelo ID (USER)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/users/${testUserId}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(200);

      expect(response.body.message).toBe('User retrieved successfully.');
      expect(response.body.data.id).toBe(testUserId);
    });

    it('deve falhar ao buscar usuário inexistente (ADMIN)', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/non-existent-id')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(404);
    });
  });

  describe('/api/v1/users/public/products (GET) - Public Access', () => {
    it('deve permitir acesso a visitantes (com token)', async () => {
      const loginVisitorDto: LoginDto = {
        email: 'admin@example.com',
        password: 'password',
      };
      const visitorLoginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(loginVisitorDto)
        .expect(200);
      const visitorAccessToken = visitorLoginResponse.body.data.accessToken;

      const response = await request(app.getHttpServer())
        .get('/api/v1/users/public/products')
        .set('Authorization', `Bearer ${visitorAccessToken}`)
        .expect(200);

      expect(response.body.message).toBe('Public access to products.');
    });

    it('deve falhar se token ausente', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/public/products')
        .expect(401);
    });
  });

  describe('/api/v1/users/admin/products (POST) - Admin-only Access', () => {
    it('deve permitir acesso para ADMIN', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/users/admin/products')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(201);

      expect(response.body.message).toBe('Product created by Admin.');
    });

    it('deve falhar se não for ADMIN (USER)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/users/admin/products')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(403);
    });

    it('deve falhar se não autenticado', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/users/admin/products')
        .expect(401);
    });
  });
});
