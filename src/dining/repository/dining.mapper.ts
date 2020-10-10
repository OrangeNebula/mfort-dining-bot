import { Injectable } from '@nestjs/common';
import { Dining, Menu } from '../domain/dining.domain';

@Injectable()
export class DiningMapper {
  toDiningObject(diningRow: any, participants: any[]): Dining {
    return new Dining(
      { ts: diningRow.ts },
      {
        id: diningRow.menuId,
        name: diningRow.name,
        imgUrl: diningRow.imgUrl,
        link: diningRow.link,
      },
      participants.map((item) => ({ user: item.user })),
      diningRow.id,
      diningRow.orderer ? { user: diningRow.orderer } : null,
      diningRow.expireAt,
    )
  }

  toMenuObject(rows: any[]): Menu[] {
    return rows.map(item => ({
      id: item.id,
      name: item.name,
      imgUrl: item.imgUrl,
      link: item.link,
    }))
  }
}