import { Injectable, Logger } from '@nestjs/common';
import { DiningRepository } from '../repository/dining.repository';
import { Dining, Menu, Participant } from '../domain/dining.domain';
import { SlackService } from '../../slack/slack.service';
import { Block, KnownBlock } from '@slack/web-api';

interface DiningMessageOptions {
  title?: string,
  expireTime?: string,
  enableButton?: boolean,
}

interface OrdererMessageOptions {
  menu?: Menu,
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

  async remindDining(): Promise<void> {
    await this.slackService.postMessage(this.getRemindMessage());
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
    // Note.
    //  Slack 레벨에서 Downloadable 하지 않응 이미지 링크일 경우, API 호출 자체가 실패한다.
    //  이런 경우를 방지하기 위해, 실패 가능성이 없는 Payload 로 다시 한번 API 를 호출한다.
    try {
      await this.slackService.postMessage(this.getOrdererMessage(orderer, {
        menu: dining.menu,
      }));
    } catch (err) {
      Logger.error(err);
      await this.slackService.postMessage(this.getOrdererMessage(orderer, {
        menu: {
          id: dining.menu.id,
          name: dining.menu.name,
        }
      }));
      throw err;
    }
  }

  getDiningMessageBlocks(
    participants: Participant[] = [],
    options: DiningMessageOptions = {},
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

  getOrdererMessage(
    orderer: Participant,
    options?: OrdererMessageOptions,
  ) {
    const textMenuSuggestion = options?.menu?.name ? `\n 메뉴는 ${options.menu.name} 어때요? :smile:` : '';
    const blocks: (KnownBlock | Block)[] = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `오늘 저녁은 <@${orderer.user}> 주문해주시겠어요? :pray: ${textMenuSuggestion}`
        }
      },
    ]
    if (options.menu.link) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `빠르게 주문하려면 모바일에서 링크를 클릭해주세요! ${options.menu.link}`,
        },
      });
    }
    if (options.menu.imgUrl) {
      blocks.push({
        type: 'image',
        title: {
          type: 'plain_text',
          text: options.menu.name,
          emoji: true
        },
        image_url: options.menu.imgUrl,
        alt_text: 'marg'
      });
    }
    return blocks;
  }

  getRemindMessage() {
    return [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `저녁 주문 마감 5분전입니다! 아직 신청하지 않으신 분은 신청해주세요~`
        }
      },
    ]
  }
}