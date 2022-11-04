import { Logger } from './../index';

export default class ConsoleLogger implements Logger {
  public info(message: string): void {
    this.log(`INFO: ${this.getDate()}: ${message}`);
  }

  public debug(message: string): void {
    this.log(`DEBUG: ${this.getDate()}: ${message}`);
  }

  public error(message: string): void {
    this.log(`ERROR: ${this.getDate()}: ${message}`);
  }

  private getDate(): string {
    const date_ob = new Date();
    const date = ('0' + date_ob.getDate()).slice(-2);
    const month = ('0' + (date_ob.getMonth() + 1)).slice(-2);
    const year = date_ob.getFullYear();
    const hours = date_ob.getHours();
    const minutes = date_ob.getMinutes();
    const seconds = date_ob.getSeconds();

    return year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + seconds;
  }

  private log(messageWithDateAndLevel: string): void {
    console.log(messageWithDateAndLevel);
  }
}
