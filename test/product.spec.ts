import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { Logger } from 'winston';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { ProductFilter } from '../src/product/product.filter';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import request from 'supertest';
import { TestModule } from './test.module';
import { TestService } from './test.service';

describe('ProductController', () => {
  let app: INestApplication<App>;
  let logger: Logger;
  let testService: TestService; // 1. Define TestService

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule], // 2. Ensure TestModule is imported here
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new ProductFilter());
    logger = app.get(WINSTON_MODULE_PROVIDER);
    testService = app.get(TestService); // 3. Get the instance
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /product/create', () => {
    beforeEach(async () => {
      await testService.deleteUser();
      await testService.deleteAdmin();
    });

    it('should be reject if user is not admin', async () => {
      await testService.createUser();
      const res = await request(app.getHttpServer()).post('/auth/login').send({
        username: 'TestSample',
        password: '123456',
      });
      const token: string = res.body.token;

      const productReq = await request(app.getHttpServer())
        .post('/product/create')
        .set('Authorization', `Bearer ${token}`)
        .field({
          product_name: 'test',
          price: 1000,
          quantity: 3,
        })
        .attach('product', Buffer.from('mock_file_content'), 'test.jpg');
      logger.info(productReq.body);
      expect(productReq.status).toBe(403);
    });
    it('should be create product', async () => {
      await testService.createAdminUser();

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'AdminUser',
          password: 'adminUser',
        });

      // Guard rail: Ensure login actually worked
      const accessToken = loginRes.body.token;

      const productReq = await request(app.getHttpServer())
        .post('/product/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .field({
          product_name: 'Test',
          price: 1000,
          quantity: 3,
        })
        .attach('product', Buffer.from('mock_file_content'), 'test.jpg');

      logger.info(productReq.body);

      expect(productReq.status).toBe(201);
    });
    afterEach(async () => {
      await testService.deleteProduct();
    });
  });

  describe('POST /product/update/:productId', () => {
    beforeEach(async () => {
      await testService.deleteAdmin();
      await testService.createAdminUser();
      await testService.createProduct();
    });

    it('should be reject if request is not valid', async () => {
      const product = await testService.getProduct();
      const loginReq = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'AdminUser', password: 'adminUser' });
      const accessToken = loginReq.body.token;

      const updateReq = await request(app.getHttpServer())
        .patch(`/product/update/${product?.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .field({
          product_name: 'test',
        });
      logger.info(updateReq.body);
      expect(updateReq.status).toBe(400);
      expect(updateReq.body.errors).toBeDefined();
    });
    it('should be rejected if product is not found', async () => {
      const product = await testService.getProduct();
      const loginReq = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'AdminUser', password: 'adminUser' });
      const accessToken = loginReq.body.token;

      // @ts-expect-error
      const updateReq = await request(app.getHttpServer())
        .patch(`/product/update/${product?.id + 1}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .field({
          price: 500,
          quantity: 5,
        });
      logger.info(updateReq.body);
      expect(updateReq.status).toBe(404);
      expect(updateReq.body.errors).toBeDefined();
    });
  });
  it('should be update product', async () => {
    const product = await testService.getProduct();
    const loginReq = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'AdminUser', password: 'adminUser' });
    const accessToken = loginReq.body.token;

    const updateReq = await request(app.getHttpServer())
      .patch(`/product/update/${product?.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .field({
        product_name: 'UpdatedProduct',
        price: 1000,
      })
      .attach('product', Buffer.from('mock_file_content'), 'update.jpg');
    logger.info(updateReq.body);
    expect(updateReq.status).toBe(201);
  });
  afterEach(async () => {
    await testService.deleteProduct();
  });
});
