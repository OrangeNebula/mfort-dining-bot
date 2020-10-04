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

  // TODO: Real DB 를 대상으로 테스트를 하고 있기 때문에 인메모리 DB 모듈을 사용하도록 수정하거나, 삭제 필요
  test('Dining 정보 조회', async () => {
    await service.getLatestActiveDining();
  });

  test('Dining participant 수정', async () => {
    await service.updateParticipant({ user: 'U111111' })
  });
});