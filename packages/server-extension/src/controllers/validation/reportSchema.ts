import { isDate, isOptional } from '@server-extension/controllers/validation/common';
import { Schema } from 'express-validator';

export const dailySchema: Schema = {
  date: {
    in: ['query'],
    ...isDate,
    custom: {
      options: (value: Date) => {
        const date = new Date(value);

        return date.getTime() < new Date().getTime();
      },
      errorMessage: 'Date should be before current date'
    }
  }
};

export const onDemandSchema: Schema = {
  startTime: {
    in: ['query'],
    ...isOptional,
    ...isDate,
    custom: {
      options: (value: Date, { req }) => {
        const date = new Date(value);
        const endTime = req.query?.endTime;

        return date
          ? date.getTime() < new Date().getTime() &&
              (endTime ? date.getTime() < new Date(endTime).getTime() : true)
          : true;
      },
      errorMessage: 'Start time cannot be greater than current date or end time'
    }
  },
  endTime: {
    in: ['query'],
    ...isOptional,
    ...isDate,
    custom: {
      options: (value: Date, { req }) => {
        const endTime = new Date(value);
        const startTime = req.query?.startTime;

        return (
          endTime.getTime() < new Date().getTime() &&
          (startTime
            ? endTime.getTime() - new Date(startTime).getTime() <= (24 * 60 - 1) * 60 * 1000
            : true)
        );
      },
      errorMessage:
        'End time cannot be greater than current date and time range cannot be greater than 23h 59m'
    }
  }
};
