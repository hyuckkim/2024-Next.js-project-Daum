"use client";

import styles from "./Calendar.module.scss";
import { ChevronRightIcon, ChevronLeftIcon } from "@radix-ui/react-icons";
import { useCallback, useMemo, useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  differenceInCalendarDays,
  getMonth,
  isSaturday,
  isSunday,
} from "date-fns";
import { date } from "zod";
import { PlusCircle } from "lucide-react";
import router from "next/router";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, usePathname } from "next/navigation";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { useCalendarDocument } from "@/hooks/use-calendar-document";
import { Calendar, generateId } from "@/types/calendar";

interface CalendarProps {
  initialContent?: string;
  onChange: (value: string) => void;
  calendarId: Id<"calendars">;
  editable: boolean;
}

const MakeCalendar = ({
  initialContent,
  onChange,
  calendarId,
  editable,
}: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [checkedDates, setCheckedDates] = useState<number[]>([]);
  const [showButton, setShowButton] = useState<number>();
  const [showDocument, setShowDocument] = useState<number>();
  const [clickedButton, setClickedButton] = useState<boolean>(false);
  //const createCalendarDocument = useMutation(api.calendars.update);

  const handleCalendarDocument = (index: number) => {
    setClickedButton(clickedButton === false ? true : clickedButton);
    setShowDocument(index);
    if (clickedButton) {
      editor.onNewElement();
    }
  };

  const editor = useCalendarDocument({
    initialContent: initialContent ? JSON.parse(initialContent) : undefined,
    onBoardChanged: (calendar) => {
      onChange(JSON.stringify(calendar, null, 2));
    },
  });

  const handleMouseEnter = (index: number) => {
    setShowButton(index);
  };

  const handleMouseLeave = () => {
    setShowButton(undefined);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const weekMock = ["일", "월", "화", "수", "목", "금", "토"];

  const nextMonthHandler = useCallback(() => {
    setCurrentDate(addMonths(currentDate, 1));
  }, [currentDate]);

  const dateClick = (index: number) => {
    // 클릭한 날짜의 index를 상태에 추가 또는 제거
    setCheckedDates((prevCheckedDates) => {
      const isDateChecked = prevCheckedDates.includes(index);
      if (isDateChecked) {
        return prevCheckedDates.filter((dateIndex) => dateIndex !== index);
      } else {
        return [...prevCheckedDates, index];
      }
    });
  };

  const prevMonthHandler = useCallback(() => {
    setCurrentDate(subMonths(currentDate, 1));
  }, [currentDate]);

  const createMonth = useMemo(() => {
    const monthArray = [];
    let day = startDate;
    while (differenceInCalendarDays(endDate, day) >= 0) {
      monthArray.push(day);
      day = addDays(day, 1);
    }
    return monthArray;
  }, [startDate, endDate]);

  return (
    <section className={styles.calendar}>
      <div className={styles.yearTitle}>{format(currentDate, "yyyy년")}</div>
      <div className={styles.monthTitle}>
        <button className={styles.prevButton} onClick={prevMonthHandler}>
          <ChevronLeftIcon />
        </button>
        <div className={styles.month}>{format(currentDate, "M월")}</div>
        <button className={styles.nextButton} onClick={nextMonthHandler}>
          <ChevronRightIcon />
        </button>
      </div>
      <div className={styles.dayContainer}>
        {weekMock.map((v, i) => {
          let style;
          if (i === 0) {
            style = {
              color: "red",
            };
          } else if (i === 6) {
            style = {
              color: "blue",
            };
          }

          return (
            <div key={`day${i}`} style={style}>
              {v}
            </div>
          );
        })}
      </div>
      <div className={styles.dateContainer}>
        {createMonth.map((v, i) => {
          let style;
          const validation = getMonth(currentDate) === getMonth(v);
          const today =
            format(new Date(), "yyyyMMdd") === format(v, "yyyyMMdd");

          //const hasPost = checkedDates.includes(i);

          if (validation && isSaturday(v)) {
            style = {
              color: "blue",
            };
          } else if (validation && isSunday(v)) {
            style = {
              color: "red",
            };
          }
          return (
            <div
              onClick={() => dateClick(i)}
              key={`date${i}`}
              className={validation ? styles.currentMonth : styles.diffMonth}
              style={style}
              onMouseEnter={() => handleMouseEnter(i)}
              onMouseLeave={handleMouseLeave}
            >
              <div className={styles.topLine}>
                <span className={styles.day}>{format(v, "d")}</span>
                {today && <span className={styles.today}>(오늘)</span>}
                {showButton === i && (
                  <PlusCircle
                    className="w-4 h-4 cursor-pointer"
                    onClick={() => handleCalendarDocument(i)}
                  />
                )}
              </div>
              {clickedButton && showDocument === i && (
                <div className="w-80% h-6 hover:bg-gray-400 border-blue-500 border-1 bg-[#DDE5FF] rounded-md flex flex-row justify-center items-center mt-5 mx-5">
                  {editor.content && initialContent}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default MakeCalendar;
