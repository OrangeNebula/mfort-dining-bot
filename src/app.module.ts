import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { KnexModule } from '@nestjsplus/knex/dist';
import { ConfigService } from './config/config.service';
import { ScheduleModule } from '@nestjs/schedule';
import { SlackModule } from './slack/slack.module';
import { DiningModule } from './dining/dining.module';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    KnexModule.registerAsync({
      useExisting: ConfigService,
    }),
    SlackModule,
    DiningModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
