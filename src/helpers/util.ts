import { NgbDateParserFormatter, NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { DateTime } from "luxon";

export function convertToDateStruct(date: any) {
  const dt = new Date(date);

  const defaultDt: NgbDateStruct = {
    day: dt.getDate(),
    month: dt.getMonth()+1,
    year: dt.getFullYear(),
  };

  return defaultDt;
};

export function formatToCurrency(val: number) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
   });

   return formatter.format(val);
}

export function formatDateTime(dt: Date | string) {
  if (dt instanceof Date) {
    return DateTime.fromJSDate(dt).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY);
  } else {
    return DateTime.fromISO(dt).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)
  }
}