import { INestApplication } from '@nestjs/common';
import { Logger } from 'winston';
import { App } from 'supertest/types';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { TestModule } from './test.module';
describe('UserController', () => {
  let app: INestApplication<App>;
  let logger: Logger;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();
  });
});
