import { Controller, Param, Post, Put } from '@nestjs/common';
import { DiningService } from './service/dining.service';

@Controller('dining')
export class DiningController {
  constructor(private readonly diningService: DiningService) {}

  @Post()
  async createDining(): Promise<void> {
    await this.diningService.createDining();
    return;
  }

  @Put('/participant/:user')
  async updateParticipant(@Param('user') user: string): Promise<void> {
    await this.diningService.updateParticipant({ user });
    return;
  }

  @Post('/orderer')
  async selectOrderer(): Promise<void> {
    await this.diningService.selectOrderer();
    return;
  }
}