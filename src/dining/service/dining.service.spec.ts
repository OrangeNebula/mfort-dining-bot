import { DiningService } from './dining.service';
import { Test, TestingModule } from '@nestjs/testing';
import { KnexModule } from '@nestjsplus/knex/dist';
import { ConfigService } from '../../config/config.service';
import { ConfigModule } from '../../config/config.module';
import { SlackModule } from '../../slack/slack.module';
import { DiningRepository } from '../repository/dining.repository';
import { DiningMapper } from '../repository/dining.mapper';

describe('Dining 서비스 테스트', () => {

  let service: DiningService;

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule,
        SlackModule,
        KnexModule.registerAsync({
          useExisting: ConfigService,
        }),
      ],
      providers: [DiningService, DiningRepository, DiningMapper]
    }).compile();
    service = app.get<DiningService>(DiningService);
  });

});