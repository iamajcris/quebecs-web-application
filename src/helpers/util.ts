import { NgbDateParserFormatter, NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";

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