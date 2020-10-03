import { WebClient, KnownBlock, Block, WebAPICallResult } from '@slack/web-api';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';

@Injectable()
export class SlackService {
  private web: WebClient;

  constructor(private configService: ConfigService) {
    console.log('init slack?');
    this.web = new WebClient(configService.getSlackToken());
  }

  public postMessage(text: string, blocks?: (KnownBlock | Block)[]): Promise<WebAPICallResult> {
    return this.web.chat.postMessage({
      channel: this.configService.getSlackChannel(),
      text,
      blocks,
    });
  }
}
