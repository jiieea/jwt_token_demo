import { INestApplication } from '@nestjs/common';
import { Logger } from 'winston';
import { App } from 'supertest/types';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { UserFilter } from '../src/user/user.filter';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { TestService } from './test.service';
import { TestModule } from './test.module';
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
    app.useGlobalFilters(new UserFilter());
    logger = app.get(WINSTON_MODULE_PROVIDER);
    testService = app.get(TestService);
    await app.init();
  }, 1000);
  afterAll(async () => {
    await app.close();
  });

  describe('GET /user/profile', () => {
    let accessToken: string;
    beforeEach(async () => {
      await testService.deleteUser();
      await testService.createUser();

      const loginRes = await request(app.get()).post('auth//login').send({
        username: 'TestSample',
        password: '123456',
      });
      accessToken = loginRes.body.token;
      console.log('Login Token', accessToken);
    });
    it('should be rejected if token is not valid', async () => {
      const response = await request(app.getHttpServer())
        .get('/user/profile')
        .set('Authorization', `Wrong`);
      console.log('Status Code:', response.status);
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });
  });
});
