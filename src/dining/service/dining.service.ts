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
      this.getDiningMessageBlocks(),
    );
    const menus = await this.diningRepository.getMenus();
    const dining = new Dining(
      { ts: postMessageResponse.ts as string },
      Dining.getRandomMenu(menus),
    )
    await this.diningRepository.insertDining(dining);
  }

  async updateParticipant(participant: Participant): Promise<void> {
    const dining = await this.getLatestActiveDining();
    if (!dining) {
      throw new Error('진행중인 저녁 투표가 없습니다!');
    }
    if (dining.isJoin(participant)) {
      dining.out(participant);
    } else {
      dining.join(participant);
    }
    await this.diningRepository.updateDining(dining);
    await this.updateDiningMessage();
    return;
  }

  async updateDiningMessage(): Promise<void> {
    const dining = await this.getLatestActiveDining();
    const result = await this.slackService.updateMessage(
      dining.message.ts,
      this.getDiningMessageBlocks(dining.participants),
    );
    console.log(result);
    return;
  }

  async selectOrderer(): Promise<void> {
    const dining = await this.getLatestDoneDining();
    console.log(dining);
    if (dining.orderer) {
      throw new Error('이미 주문할 사람이 정해져있습니다.');
    }
    const orderer = dining.selectOrderer();
    if (!orderer) {
      throw new Error('오늘은 저녁 멤버가 없습니다.');
    }
    await this.diningRepository.updateDining(dining);
    await this.slackService.postMessage([], `오늘 주문은 <@${orderer.user}> 님이 해주세요!`);
  }

  getLatestActiveDining(): Promise<Dining | null> {
    return this.diningRepository.getLatestDining();
  }

  getLatestDoneDining(): Promise<Dining | null> {
    return this.diningRepository.getLatestDoneDining();
  }

  getDiningMessageBlocks(participants: Participant[] = [], title= '저녁 드실분?', ) {
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