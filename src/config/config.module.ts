import { Global, Module } from '@nestjs/common';
import { ConfigManagerModule } from '@nestjsplus/config';
import { ConfigService } from './config.service';

@Global()
@Module({
  imports: [
    ConfigManagerModule.register({
      useEnv: {
        folder: 'src/config',
      }
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}