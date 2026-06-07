import { INestApplication } from '@nestjs/common';
import { Logger } from 'winston';
import { TestService } from './test.service';
import { Test, TestingModule } from '@nestjs/testing';
import { TestModule } from './test.module';
import { AppModule } from '../src/app.module';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import request from 'supertest';

describe('CartController', () => {
  let app: INestApplication;
  let logger: Logger;
  let testService: TestService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestModule, AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    logger = app.get(WINSTON_MODULE_PROVIDER);
    testService = app.get(TestService); // 3. Get the instance
    await app.init();
  });
  afterAll(async () => {
    await app.close();
  });

  describe('POST /cart/add', () => {
    beforeEach(async () => {
      await testService.createAdminUser();
    });
    it('Should be add product to cart', async () => {
      const loginReq = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'AdminUser',
          password: 'adminUser',
        });

      const accessToken = loginReq.body.token;

      await testService.createProduct();
      const product = await testService.getProduct();
      const addToCart = await request(app.getHttpServer())
        .post('/cart/add')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          product_id: product?.id,
          quantity: 1,
        });
      logger.info(addToCart.body);
      expect(addToCart.status).toBe(201);
    });
  });
});
