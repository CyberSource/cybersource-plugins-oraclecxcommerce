const CORRECTION_MINUTES = 3;

export function getOnDemandInterval(startDate?: Date, endDate?: Date): Interval {
  if (!startDate && !endDate) {
    startDate = getDatePlusDays(-1);
    endDate = getCorrectedDate(new Date(), -CORRECTION_MINUTES);
  }
  if (!startDate) {
    startDate = getCorrectedDate(getDatePlusDays(-1, endDate), CORRECTION_MINUTES);
  }
  if (!endDate) {
    endDate = new Date(
      Math.min(
        getDatePlusDays(1, startDate).getTime(),
        getCorrectedDate(new Date(), -CORRECTION_MINUTES).getTime()
      )
    );
  }

  if (shouldApplyCorrection(startDate, endDate)) {
    endDate = getCorrectedDate(endDate, -CORRECTION_MINUTES);
  }

  return { startDate, endDate };
}

interface Interval {
  startDate: Date;
  endDate: Date;
}

export function getDatePlusDays(plusDays: number, date?: Date) {
  const newDate = date ? new Date(date) : new Date();
  newDate.setDate(newDate.getDate() + plusDays);
  return newDate;
}

export function getCorrectedDate(date: Date, minutes: number): Date {
  const res = new Date(date);
  res.setTime(date.getTime() + minutes * 1000 * 60);
  return res;
}

function shouldApplyCorrection(startDate: Date, endDate: Date) {
  const duration = (endDate.getTime() - startDate.getTime()) / 1000 / 60;
  return duration >= 24 * 60 - 1;
}
