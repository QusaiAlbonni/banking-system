import { AdvancedConsoleLogger, LoggerOptions, QueryRunner } from 'typeorm';

export class Logger extends AdvancedConsoleLogger {
  constructor(options?: LoggerOptions) {
    super(options);
  }
  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
    const err = new Error('👣 Query called from:');
    console.error(err.stack); // full stack trace

    super.logQuery(query, parameters, queryRunner);
  }
}
