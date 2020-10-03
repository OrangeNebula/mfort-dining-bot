import { Module } from '@nestjs/common';
import { ConfigManagerModule } from '@nestjsplus/config/index';
import { SlackService } from './slack.service';

@Module({
  imports: [
    ConfigManagerModule.register({
      useEnv: {
        folder: 'src/config',
      }
    }),
  ],
  providers: [SlackService],
  exports: [SlackService],
})
export class SlackModule {}