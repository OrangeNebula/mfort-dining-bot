import { ConfigManager } from '@nestjsplus/config';
import * as Joi from '@hapi/joi';
import { KnexOptions, KnexOptionsFactory } from '@nestjsplus/knex';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService extends ConfigManager implements KnexOptionsFactory {
  public provideConfigSpec(environment: any) {
    return {
      DB_HOST: {
        validate: Joi.string(),
        required: false,
        default: 'localhost',
      },
      DB_PORT: {
        validate: Joi.number()
          .min(3306)
          .max(65535),
        required: false,
        default: 3306,
      },
      DB_USERNAME: {
        validate: Joi.string(),
        required: true,
      },
      DB_PASSWORD: {
        validate: Joi.string(),
        required: true,
      },
      DB_NAME: {
        validate: Joi.string(),
        required: true,
      },
      SLACK_TOKEN: {
        validate: Joi.string(),
        required: true,
      },
      SLACK_CHANNEL: {
        validate: Joi.string(),
        require: true,
      }
    };
  }

  public createKnexOptions(): KnexOptions {
    return {
      client: 'mysql',
      debug: true,
      connection: {
        host: this.get<string>('DB_HOST'),
        user: this.get<string>('DB_USERNAME'),
        password: this.get<string>('DB_PASSWORD'),
        database: this.get<string>('DB_NAME'),
        port: this.get<number>('DB_PORT'),
      },
    };
  }

  public getSlackToken(): string {
    return this.get<string>('SLACK_TOKEN');
  }

  public getSlackChannel(): string {
    return this.get<string>('SLACK_CHANNEL');
  }
}