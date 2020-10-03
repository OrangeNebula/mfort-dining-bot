import { Util } from '../../core/Util';

export enum DiningLogStatus {
  Join = 'join',
  Out = 'out',
}

export interface Menu {
  id: number;
  name: string;
  imgUrl?: string;
  link?: string;
}

export interface Participant {
  user: string;
}

export interface DiningLog {
  user: string;
  createAt: Date;
  status: DiningLogStatus;
}

export interface DiningMessage {
  id?: number;
  ts: string;
}

export class Dining {
  public menu: Menu;

  public logs: DiningLog[] = [];

  public createDate: Date;

  public expireDate: Date;

  constructor(
    public readonly message: DiningMessage,
    menus: Menu[],
    public participants: Participant[] = [],
  ) {
    this.menu = menus[Util.rand(0, menus.length)];
    this.createDate = new Date();
  }

  public isJoin(participant: Participant): boolean {
    return !!this.participants.find(item => item.user === participant.user);
  }

  public join(participant: Participant): void {
    if (!this.isJoin(participant)) {
      this.participants.push(participant);
      this.logs.push({
        createAt: new Date(),
        status: DiningLogStatus.Join,
        user: participant.user,
      });
    }
  }

  public out(participant: Participant): void {
    if (this.isJoin(participant)) {
      const index = this.participants.findIndex(item => item.user === participant.user);
      this.participants.splice(index, 1);
      this.logs.push({
        createAt: new Date(),
        status: DiningLogStatus.Out,
        user: participant.user,
      });
    }
  }
}