import { Injectable } from '@nestjs/common';
import { DiningRepository } from '../repository/dining.repository';
import { Dining, Participant } from '../domain/dining.domain';
import { SlackService } from '../../slack/slack.service';

interface DiningMessageOptions {
  title?: string,
  expireTime?: string,
  enableButton?: boolean,
}

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
    const dining = await this.diningRepository.getLatestDining();
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
    const dining = await this.diningRepository.getLatestDining();
    await this.slackService.updateMessage(
      dining.message.ts,
      this.getDiningMessageBlocks(dining.participants),
    );
    return;
  }

  async expireDining(): Promise<void> {
    const dining = await this.diningRepository.getLatestDining();
    dining.expire();
    await this.diningRepository.updateDining(dining);
    await this.slackService.updateMessage(
      dining.message.ts,
      this.getDiningMessageBlocks(dining.participants, {
        enableButton: false,
      }),
    )
  }

  async selectOrderer(): Promise<void> {
    const dining = await this.diningRepository.getLatestDoneDining();
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

  getDiningMessageBlocks(
    participants: Participant[] = [],
    options?: DiningMessageOptions,
  ) {
    const title = options.title || '저녁 신청받습니다!'
    const expireTime = options.expireTime || '17:30';
    const enableButton = options.enableButton !== undefined ? options.enableButton : true;
    const mentions = participants.map(item => `<@${item.user}>`).join(',');
    const buttonBlock = {
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
    };
    const disabledButtonBlock = {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "신청이 마감되었습니다! :meat_on_bone:"
      }
    }
    return [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: title,
          emoji: true
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `맘편한 저녁식사 봇입니다 :pizza: \n저녁을 드실 분은 '먹을래요!' 를 클릭해주세요. :pray: \n취소할 때는 다시 한번 버튼을 클릭하면 됩니다! *${expireTime}분까지 신청받을께요.*`
        }
      },
      enableButton ? buttonBlock : disabledButtonBlock,
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