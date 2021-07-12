import nconf from 'nconf';
import { Logger } from 'winston';

class LoggingService {
  logger!: Logger;

  init(logger: Logger) {
    this.logger = logger;
  }

  info(name: string, infoObject: any) {
    nconf.get(name) && this.logger.info(infoObject);

    return this.logger;
  }

  error(name: string, errorObject: any) {
    if (nconf.get(name)) {
      if (errorObject instanceof Error) {
        this.logger.error(`${errorObject.message}, STACK TRACE: ${errorObject.stack}`);
      } else {
        this.logger.error(String(errorObject));
      }
    }

    return this.logger;
  }
}

export default new LoggingService();
