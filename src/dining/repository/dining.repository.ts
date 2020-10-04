import { Injectable, Inject } from '@nestjs/common';
import { DiningMapper } from './dining.mapper';
import { KNEX_CONNECTION } from '@nestjsplus/knex/dist';
import { Dining } from '../domain/dining.domain';
import { Util } from '../../core/Util';

@Injectable()
export class DiningRepository {
  constructor(
    private mapper: DiningMapper,
    @Inject(KNEX_CONNECTION) private readonly knex,
  ) {
  }

  private getDiningQuery() {
    return this.knex
      .select(
        'dining.id', 'dining.menuId', 'dining.messageId', 'dining.createAt', 'dining.expireAt', 'dining.orderer',
        'menu.name', 'menu.imgUrl', 'menu.link',
        'slack_message.ts',
      )
      .from('dining')
      .leftJoin('menu', 'dining.menuId', 'menu.id')
      .leftJoin('slack_message', 'dining.messageId', 'slack_message.id')
      .orderBy('dining.id', 'desc');
  }

  private async getParticipantsRows(diningId: number) {
    return this.knex.select('user')
      .from('participants')
      .where({
        diningId,
      });
  }

  async getMenus() {
    const results = await this.knex.select('id', 'name', 'imgUrl', 'link').from('menu');
    return this.mapper.toMenuObject(results);
  }

  async insertDining(dining: Dining): Promise<void> {
    await this.knex.transaction(async trx => {
      const [messageId] = await trx('slack_message').insert({
        ts: dining.message.ts,
      }).returning('id');
      await trx('dining').insert({
        menuId: dining.menu.id,
        messageId: messageId,
        createAt: dining.createDate,
        expireAt: dining.expireDate,
      });

    })
  }

  async getLatestDining(): Promise<Dining | null> {
    const [diningRow] = await this.getDiningQuery()
      .where('dining.expireAt', '>', Util.toSql(new Date()))
      .limit(1)
    if (!diningRow) {
      return null;
    }
    const participantsRows = await this.getParticipantsRows(diningRow.id);
    return this.mapper.toDiningObject(diningRow, participantsRows);
  }

  async getLatestDoneDining(): Promise<Dining | null> {
    const [diningRow] = await this.getDiningQuery()
      .where('dining.expireAt', '<=', Util.toSql(new Date()))
      .limit(1)
    if (!diningRow) {
      return null;
    }
    const participantsRows = await this.getParticipantsRows(diningRow.id);
    return this.mapper.toDiningObject(diningRow, participantsRows);
  }

  async updateDining(dining: Dining): Promise<void> {
    await this.knex.transaction(async trx => {
      if (dining.orderer) {
        await trx('dining').where('id', dining.id).update({
          orderer: dining.orderer.user,
        });
      }
      await trx('participants').where('diningId', dining.id).del();
      await trx('participants').insert(dining.participants.map(item => ({
        diningId: dining.id,
        user: item.user,
      })));
      await trx('vote_log').insert(dining.logs.map(item => ({
        diningId: dining.id,
        user: item.user,
        createAt: Util.toSql(item.createAt),
        status: item.status,
      })));
    });
  }
}