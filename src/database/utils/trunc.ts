import { PeriodType } from '@/common/types';

export function sqlTrunc(period: PeriodType) {
  if (period === 'day') return "date_trunc('day', :d::timestamptz)";
  if (period === 'month') return "date_trunc('month', :d::timestamptz)";
  return "date_trunc('year', :d::timestamptz)";
}
