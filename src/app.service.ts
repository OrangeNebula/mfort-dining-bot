import { Injectable } from '@nestjs/common';
import { SlackService } from './slack/slack.service';

@Injectable()
export class AppService {
  constructor(
    private slackService: SlackService,
  ) {
  }

  async getHello(): Promise<string> {
    return 'Hello World!';
  }
}
