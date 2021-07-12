import ko from 'knockout';

export const alertMessages = ko.observableArray(<string[]>[]);
export const updateAlerts = (...msg: string[]) => alertMessages.push(msg.join('\n'));
export const prettyJson = (obj: any) => JSON.stringify(obj, null, 4);

const preProcessLogs = (
  type: 'INFO' | 'DEBUG' | 'WARN' | 'ERROR',
  message: string,
  pObject?: any
) => {
  const logs = [`(${type}) ${message}`];

  if (pObject) {
    logs.push(prettyJson(pObject));
  }

  updateAlerts(...logs);

  return logs;
};

export default {
  info(message: string, pObject?: any) {
    console.info(preProcessLogs('INFO', message, pObject));
  },

  debug(message: string, pObject?: any) {
    console.debug(preProcessLogs('DEBUG', message, pObject));
  },

  warn(message: string, pObject?: any) {
    console.warn(preProcessLogs('WARN', message, pObject));
  },

  error(message: string, pObject?: any) {
    console.error(preProcessLogs('ERROR', message, pObject));
  }
};
