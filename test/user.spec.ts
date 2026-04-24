import { INestApplication } from '@nestjs/common';
import { Logger } from 'winston';
import { App } from 'supertest/types';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { TestModule } from './test.module';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { TestService } from './test.service';
import request from 'supertest';
describe('UserController', () => {
  let app: INestApplication<App>;
  let logger: Logger;
  let testService: TestService;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();
    app = moduleFixture.createNestApplication();
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
      expect(response.status).toBe(500);
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
});
