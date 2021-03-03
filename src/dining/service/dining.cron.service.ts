import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DiningService } from './dining.service';
import { DiningRepository } from '../repository/dining.repository';

@Injectable()
export class DiningCronService {
  private readonly logger = new Logger(DiningCronService.name);

  constructor(
    private service: DiningService,
    private repository: DiningRepository,
  ) {}

  @Cron('0 0 15 * * 1-5')
  async createDining() {
    await this.service.createDining();
  }

  @Cron('0 55 17 * * 1-5')
  async remindDining() {
    await this.service.remindDining();
  }

  @Cron('0 0 18 * * 1-5')
  async closeDining() {
    await this.service.expireDining();
    await this.service.selectOrderer();
  }
}
