import { Injectable } from '@nestjs/common';
import { DiningRepository } from '../repository/dining.repository';
import { Dining, Participant } from '../domain/dining.domain';
import { SlackService } from '../../slack/slack.service';

@Injectable()
export class DiningService {
  constructor(
    private diningRepository: DiningRepository,
    private slackService: SlackService,
  ) {
  }

  async createDining() {
    const postMessageResponse = await this.slackService.postMessage(
      '저녁 드실분?',
      this.getDiningMessageBlocks(),
    );
    const menus = await this.diningRepository.getMenus();
    const dining = new Dining(
      { ts: postMessageResponse.ts as string },
      menus,
    )
    await this.diningRepository.insertDining(dining);
  }

  getDining() {

  }

  updateParticipant() {
    
  }

  getDiningMessageBlocks(title= '저녁 드실분?', participants: Participant[] = []) {
    const mentions = participants.map(item => `<@${item.user}>`).join(',');
    return [{
      type: 'header',
      text: {
        type: 'plain_text',
        text: title,
        emoji: true
      }
    },
      {
        type: 'actions',
        elements: [{
          type: 'button',
          text: {
            type: 'plain_text',
            text: '먹을래요!',
            emoji: true
          },
          value: 'Yes'
        }]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `저녁멤버: ${mentions}`,
        }
      }
    ]
  }
}