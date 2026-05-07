import { INestApplication } from '@nestjs/common';
import { Logger } from 'winston';
import { App } from 'supertest/types';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { TestModule } from './test.module';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { TestService } from './test.service';
import request from 'supertest';
import { UserFilter } from '../src/user/user.filter';
import { response } from 'express';

describe('AuthController', () => {
  let app: INestApplication<App>;
  let logger: Logger;
  let testService: TestService;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new UserFilter());
    logger = app.get(WINSTON_MODULE_PROVIDER);
    testService = app.get(TestService);
    await app.init();
  }, 1000);
  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/', () => {
    beforeEach(async () => {
      await testService.deleteUser();
    });
    it('should be register new user', async () => {
      const response = await request(app.getHttpServer()).post('/auth/').send({
        username: 'TestSample',
        password: '123456',
      });

      console.log('STATUS:', response.status);
      console.log('BODY:', JSON.stringify(response.body, null, 2));

      expect(response.status).toBe(201);
      expect(response.body.username).toBe('TestSample');
    });
    it('should be rejected if request is not valid', async () => {
      const response = await request(app.getHttpServer()).post('/auth/').send({
        username: '',
        password: '',
      });
      logger.info('STATUS:', response.status);
      console.log('BODY:', JSON.stringify(response.body, null, 2));
      expect(response.status).toBe(400);
      expect(response.body).toBeDefined();
    });
    it('should be rejected if user already exists', async () => {
      await testService.createUser();
      const response = await request(app.getHttpServer()).post('/auth/').send({
        username: 'TestSample',
        password: '123456',
      });
      logger.info('STATUS:', response.status);
      console.log('BODY:', JSON.stringify(response.body, null, 2));
      expect(response.status).toBe(404);
      expect(response.body).toBeDefined();
    });
  });
  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await testService.deleteUser();
      await testService.createUser();
    });
    it('should be rejected if request is not valid', async () => {
      const res = await request(app.getHttpServer()).post('/auth/login').send({
        username: 'test',
        password: '123456',
      });
      logger.info('STATUS:', res.status);
      console.log('BODY:', JSON.stringify(res.body, null, 2));
      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
    it('should be login authorized user', async () => {
      const res = await request(app.getHttpServer()).post('/auth/login').send({
        username: 'TestSample',
        password: '123456',
      });
      console.log('STATUS:', res.status);
      console.log('BODY:', JSON.stringify(res.body, null, 2));
      expect(res.status).toBe(201);
      expect(res.body.username).toBe('TestSample');
      expect(res.body.token).toBeDefined();
    });
  });

  describe('POST /auth/logout', () => {
    let accessToken: string = '';
    beforeEach(async () => {
      await testService.deleteUser();
      await testService.createUser();
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'TestSample',
          password: '123456',
        });
      accessToken = loginRes.body.token;
      console.log('LOGIN TOKEN:', accessToken); // debug penting
    });

    it('should be rejected if the token is not valid', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', 'Wrong');

      accessToken = response.body.token;

      console.log('STATUS:', response.status);
      console.log('BODY:', JSON.stringify(response.body, null, 2));
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });
    it('should be logout authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);
      console.log('STATUS', response.status);
      console.log('Current Token', accessToken);
      console.log('BODY', JSON.stringify(response.body, null, 2));
      expect(response.status).toBe(201);
    });
  });
  describe('GET /user/profile', () => {
    let accessToken: string;
    beforeEach(async () => {
      await testService.deleteUser();
      await testService.createUser();

      // run login request to get accessToken
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'TestSample',
          password: '123456',
        });
      accessToken = loginRes.body.token;
      console.log('Login Token', accessToken);
    });
    it('should be rejected if token is not valid', async () => {
      const response = await request(app.getHttpServer())
        .get('/user/profile')
        .set('Authorization', `Bearer invalid.invalid.invalid`);
      console.log('Status Code:', response.status);
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });
    it('should be showing authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .get('/user/profile')
        .set('Authorization', `Bearer ${accessToken}`);
      logger.info('STATUS:', response.status);
      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.user).toBe('TestSample');
    });
  });
  describe('GET /user/users', () => {
    let accessToken: string;
    beforeEach(async () => {
      await testService.deleteUser();
      await testService.createUser();
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'TestSample',
          password: '123456',
        });
      accessToken = loginResponse.body.token;
      logger.info(accessToken);
    });
    it('should be rejected if token is not valid', async () => {
      const response = await request(app.getHttpServer())
        .get('/user/users')
        .set('Authorization', 'Bearer invalid.invalid.invalid');
      logger.info('STATUS:', response.status);
      logger.info(response.body);
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });
    it('should be showing users', async () => {
      const res = await request(app.getHttpServer())
        .get('/user/users')
        .query({
          size: 4,
          page: 1,
        })
        .set('Authorization', `Bearer ${accessToken}`);
      logger.info('STATUS:', res.status);
      logger.info(`current token ${accessToken}`);
      logger.info(res.body);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(4);
      expect(res.body.paging.pages).toBe(1);
      expect(res.body.paging.total_page).toBe(1);
      expect(res.body.paging.total_item).toBe(4);
    });
  });
  describe('GET /user/search', () => {
    let accessToken: string;
    beforeEach(async () => {
      await testService.deleteUser();
      await testService.createUser();

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'TestSample',
          password: '123456',
        });
      accessToken = loginResponse.body.token;
    });
    it('should be rejected if token is not valid', async () => {
      const response = await request(app.getHttpServer())
        .get('/user/search')
        .query({
          search: 't',
          page: 1,
          size: 2,
        })
        .set('Authorization', `Bearer invalid.invalid`);
      logger.info('STATUS:', response.status);
      logger.info(response.body);
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });
    it('should be return empty array if search is not found', async () => {
      const response = await request(app.getHttpServer())
        .get('/user/search')
        .query({
          search: 'invalid search',
          page: 1,
          size: 2,
        })
        .set('Authorization', `Bearer ${accessToken}`);
      logger.info(response.body);
      logger.info(response.status);
      expect(response.body.data.length).toBe(0);
      expect(response.status).toBe(200);
      expect(response.body.paging.pages).toBe(1);
      expect(response.body.paging.total_page).toBe(0);
      expect(response.body.paging.total_item).toBe(0);
    });
    it('should be able to search with param', async () => {
      const response = await request(app.getHttpServer())
        .get('/user/search')
        .query({
          search: 't',
          page: 1,
          size: 2,
        })
        .set('Authorization', `Bearer ${accessToken}`);
      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(2);
      expect(response.body.paging.pages).toBe(1);
      expect(response.body.paging.total_page).toBe(1);
      expect(response.body.paging.total_item).toBe(2);
    });
  });
});
