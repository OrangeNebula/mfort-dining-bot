import { DateTime } from 'luxon';

type Unit = 'minutes' | 'hours' | 'days';

export class Util {
  static rand(min: number, max: number): number {
    return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min))) + Math.ceil(min);
  }

  static add(base: Date, value: number, unit: Unit): Date {
    return this.fromJsDate(base).plus({ [unit]: value }).toJSDate();
  }

  static fromJsDate(date: Date): DateTime {
    return DateTime.fromJSDate(date);
  }

  static toSql(date: Date): string {
    return this.fromJsDate(date).toSQL();
  }
}