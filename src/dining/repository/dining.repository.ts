import { Injectable, Inject } from '@nestjs/common';
import { DiningMapper } from './dining.mapper';
import { KNEX_CONNECTION } from '@nestjsplus/knex/dist';
import { Dining } from '../domain/dining.domain';

@Injectable()
export class DiningRepository {
  constructor(
    private mapper: DiningMapper,
    @Inject(KNEX_CONNECTION) private readonly knex,
  ) {
  }

  getMenus() {
    const results = this.knex.select('id', 'name', 'imgUrl', 'link').from('menu');
    return this.mapper.toMenuObject(results);
  }

  async insertDining(dining: Dining): Promise<void> {
    await this.knex.transaction(async trx => {
      await trx('dining').insert({
        menuId: dining.menu.id,
        messageId: dining.message.id,
        createAt: dining.createDate,
        expiredAt: null,
      });
      await trx('slack_message').insert({
        ts: dining.message.ts,
      });
    })
  }

  updateDining() {

  }
}