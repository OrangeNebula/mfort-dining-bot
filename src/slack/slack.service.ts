import { WebClient, KnownBlock, Block, WebAPICallResult } from '@slack/web-api';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';

@Injectable()
export class SlackService {
  private web: WebClient;

  constructor(private configService: ConfigService) {
    this.web = new WebClient(configService.getSlackToken());
  }

  public postMessage(blocks?: (KnownBlock | Block)[], text?: string): Promise<WebAPICallResult> {
    return this.web.chat.postMessage({
      channel: this.configService.getSlackChannel(),
      text,
      blocks,
    });
  }

  public updateMessage(ts: string, blocks?: (KnownBlock | Block)[], text?: string): Promise<WebAPICallResult> {
    return this.web.chat.update({
      channel: this.configService.getSlackChannel(),
      ts,
      text,
      blocks,
    });
  }
}
