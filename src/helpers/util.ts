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