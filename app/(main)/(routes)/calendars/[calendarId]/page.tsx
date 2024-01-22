"use client";

import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import moment from "moment";

interface CustomCalendarProps {
  onChange: (selectedDate: Date) => void;
  value?: Date;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({ onChange, value }) => {
  const [nowDate, setNowDate] = useState<string>("날짜");
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleToggleCalendar = () => {
    setIsOpen(!isOpen);
  };

  const handleDateChange = (selectedDate: Date) => {
    onChange(selectedDate);
    setIsOpen(false);
    setNowDate(moment(selectedDate).format("YYYY년 MM월 DD일"));
  };

  return (
    <div className="relative">
      <div
        className="w-200 h-48 border-solid border-0.8 border-gray-600 rounded-10 px-12 text-gray-800 font-SUITVariable text-16 font-medium leading-140 text-left appearance-none bg-white bg-right-12px-center bg-no-repeat bg-size-12"
        onClick={handleToggleCalendar}
      >
        <div
          className="z-11 absolute top-full left-0 ${isOpen ? 'block' : 'hidden"
          onChange={handleDateChange}
          value={value}
        >
          <Calendar />
        </div>
      </div>
    </div>
  );
};

export default CustomCalendar;
