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

  return <div>hi</div>;
};

export default CustomCalendar;
