import { Logger } from './../index';

export default class OccLogger implements Logger {
  private readonly globalAny: any = global;
  private readonly logger = this.globalAny.occ.logger;

  public info(message: string): void {
    this.logger.info(message);
  }

  public debug(message: string): void {
    this.logger.debug(message);
  }

  public error(message: string): void {
    this.logger.error(message);
  }
}
