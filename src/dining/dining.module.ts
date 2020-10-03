import { Module } from '@nestjs/common';
import { KnexModule } from '@nestjsplus/knex/dist';
import { ConfigService } from '../config/config.service';
import { DiningCronService } from './service/dining.cron.service';
import { DiningService } from './service/dining.service';
import { DiningRepository } from './repository/dining.repository';
import { DiningMapper } from './repository/dining.mapper';
import { SlackModule } from '../slack/slack.module';

@Module({
  imports: [
    KnexModule.registerAsync({
      useExisting: ConfigService,
    }),
    SlackModule,
  ],
  providers: [DiningCronService, DiningService, DiningRepository, DiningMapper],
  exports: [DiningCronService, DiningService],
})
export class DiningModule {}