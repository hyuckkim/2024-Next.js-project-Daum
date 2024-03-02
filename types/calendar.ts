import { Id } from "@/convex/_generated/dataModel";
export type Calendar = CalendarDocumentElement[];

export type CalendarDocumentElement = {
  _id: string;
  name: string;
  content: CalendarDocument[];
  calendarIndex: number;
  calendarMonth: number;
};

//calendar에 들어갈 내용
export type CalendarDocument = {
  _id: string;
  name?: string;
  content?: [];
};

export const newCalendarDocument = (...names: string[]): Calendar => {
  return names.map((v) => {
    const currentDate = new Date();
    const formattedDate = `${currentDate.getMonth() + 2}`;

    return {
      _id: generateId(),
      name: v,
      content: [],
      calendarIndex: +v,
      calendarMonth: +formattedDate,
    };
  });
};

export function generateId() {
  var S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return `${S4()}${S4()}${S4()}${S4()}`;
}

export function parseDateByIndex(month: number, index: number): Date {
  const today = new Date();

  const thisYear = new Date(today.getFullYear(), month - 1, 1);
  thisYear.setDate(thisYear.getDate() - thisYear.getDay() + index);

  // 연도가 구분되어 있지 않고, '목표' 이므로 시간이 일주일을 넘기면 다음 해의 날짜를 대신 카운트
  if (getDayDifference(today, thisYear) > -7) return thisYear;

  const nextYear = new Date(today.getFullYear() + 1, month - 1, 1);
  nextYear.setDate(nextYear.getDate() - nextYear.getDay() + index);

  return nextYear;
}

function getDayDifference(date1: Date, date2: Date) {
    const diffInMilliseconds = Math.abs(date2.getTime() - date1.getTime());
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const daysDifference = Math.floor(diffInMilliseconds / millisecondsPerDay);
    return daysDifference;
}
