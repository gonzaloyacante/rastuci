type PeriodDates = {
  currentStart: Date;
  currentEnd: Date;
  previousStart: Date;
  previousEnd: Date;
};

function shiftDate(base: Date, period: string, multiplier: number): Date {
  const d = new Date(base);
  if (period === "week") d.setDate(d.getDate() + 7 * multiplier);
  else if (period === "quarter") d.setMonth(d.getMonth() + 3 * multiplier);
  else if (period === "year") d.setFullYear(d.getFullYear() + multiplier);
  else d.setMonth(d.getMonth() + multiplier); // "month" is default
  return d;
}

export function getPeriodDates(period: string): PeriodDates {
  const now = new Date();
  const currentEnd = new Date(now);
  const currentStart = shiftDate(now, period, -1);
  const previousEnd = new Date(currentStart);
  const previousStart = shiftDate(previousEnd, period, -1);
  return { currentStart, currentEnd, previousStart, previousEnd };
}
