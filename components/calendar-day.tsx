import styles from "./Calendar.module.scss";

import { format, getMonth, isSaturday, isSunday } from "date-fns";
import { PlusCircle } from "lucide-react";
import editor from "./editor";
import { CalendarDocumentElement } from "@/types/calendar";

export const CalendarDay = ({
  day: v,
  today: currentDate,
  index,
  onMouseEnter,
  onMouseLeave,
  highlighted,
  addDocument,
  content,
}: {
  day: Date;
  today: Date;
  index: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  highlighted?: boolean;

  addDocument: () => void;

  content?: CalendarDocumentElement[];
}) => {
  let style;
  const validation = getMonth(currentDate) === getMonth(v);
  const today = format(new Date(), "yyyyMMdd") === format(v, "yyyyMMdd");

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
      className={validation ? styles.currentMonth : styles.diffMonth}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={styles.topLine}>
        <span className={styles.day}>{format(v, "d")}</span>
        {today && <span className={styles.today}>(오늘)</span>}
        {highlighted && (
          <PlusCircle
            className="w-4 h-4 cursor-pointer"
            onClick={addDocument}
          />
        )}
      </div>
      {content &&
        content.map((v, i) => (
          <div
            key={v._id}
            className="w-80% h-6 hover:bg-gray-400 border-blue-500 border-1 bg-[#DDE5FF] rounded-md flex flex-row justify-center items-center mt-5 mx-5"
          >
            {index === i && content[i].name}
          </div>
        ))}
    </div>
  );
};
