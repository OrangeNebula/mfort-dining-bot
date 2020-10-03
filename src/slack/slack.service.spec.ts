import { SlackService } from './slack.service';
import { ConfigService } from '../config/config.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigManagerModule } from '@nestjsplus/config/index';

describe('슬랙 서비스 모듈 테스트', () => {
  let slackService: SlackService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigManagerModule.register({
          useEnv: {
            folder: 'src/config',
          }
        }),
      ],
      providers: [ConfigService],
      exports: [ConfigService],
    }).compile();
    const config = app.get<ConfigService>(ConfigService);
    slackService = new SlackService(config);
  });

  it('메시지 전송 테스트', async () => {
    const result = await slackService.postMessage('테스트 메시지');
    expect(!!result.error).toBe(false);
  });
})