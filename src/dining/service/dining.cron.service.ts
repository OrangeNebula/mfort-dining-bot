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
  ) {
    console.log('init?');
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  handleTest() {
    this.service.createDining();
  }

  @Cron('0 0 17 * * 1-5')
  async handleCron() {
    // const menus = await this.repository.getMenus();
    // this.diningService.createDining();
  }
}