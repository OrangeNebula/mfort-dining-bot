import { Injectable } from '@nestjs/common';
import { Dining, Menu } from '../domain/dining.domain';

// TODO: repository 에서 오는 데이터를 객체로 전환하는 책임을 가지고 있음
// TODO: nest 에서 제공하는 pipes 로 transform 을 하면 될텐데, 좋은 방법이 없을까?

@Injectable()
export class DiningMapper {
  /*toDiningObject(): Dining {
  }*/

  toMenuObject(rows: any[]): Menu[] {
    return rows.map(item => ({
      id: item.id,
      name: item.name,
      imgUrl: item.imgUrl,
      link: item.link,
    }))
  }
}