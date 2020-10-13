import { Controller, Param, Body, Post, Put } from '@nestjs/common';
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

  @Post('/participant')
  async participate(@Body() participateDTO: any): Promise<void> {
    const payload = JSON.parse(decodeURIComponent(participateDTO.payload.replace(/\+/g, ' ')));
    await this.diningService.updateParticipant({ user: payload.user.id });
    return;
  }

  @Put('/expire')
  async expire(): Promise<void> {
    await this.diningService.expireDining();
  }

  @Put('/remind')
  async remind(): Promise<void> {
    await this.diningService.remindDining();
  }

  @Post('/orderer')
  async selectOrderer(): Promise<void> {
    await this.diningService.selectOrderer();
    return;
  }
}