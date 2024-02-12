import { Id } from "@/convex/_generated/dataModel";

export type Calendar = CalendarDocumentElement[];

export type CalendarDocumentElement = {
  _id: string;
  name: string;
  content: CalendarDocument[];
};

export type CalendarDocument = {
  _id: string;
  name?: string;
  content?: [];
};

export const newCalendarDocument = (...names: string[]): Calendar => {
  return names.map((v) => {
    return {
      _id: generateId(),
      name: v,
      content: [],
    };
  });
};

export function generateId() {
  var S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return `${S4()}${S4()}${S4()}${S4()}`;
}
