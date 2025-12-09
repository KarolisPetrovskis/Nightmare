// TODO:
// In the wireframe the ScheduleManagement does not display year, however when clicked on a day it navigates to CurrentScheduleManagement with year-month-day format (Probbably need to include year display here as well)
// Improve Calendar design from aesthethics side

import "./ScheduleManagement.css";
import "../../App.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function getMonthMatrix(year: number, month: number) {
  // month: 0-11
  const first = new Date(year, month, 1);
  const startDay = (first.getDay() + 6) % 7; // convert Sun(0) -> 6, Mon->0 in Javascript for some reason weekdays are: Sunday = 0, monday = 1, ..., Saturday = 6
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const matrix: Array<Array<{ day: number; inMonth: boolean }>> = [];
  let row: Array<{ day: number; inMonth: boolean }> = [];

  // fill leading days from previous month
  for (let i = 0; i < startDay; i++) {
    row.push({ day: prevMonthDays - startDay + 1 + i, inMonth: false });
  }

  // fill current month
  for (let d = 1; d <= daysInMonth; d++) {
    row.push({ day: d, inMonth: true });
    if (row.length === 7) {
      matrix.push(row);
      row = [];
    }
  }

  // fill trailing days from next month
  let nextDay = 1;
  while (row.length < 7) {
    row.push({ day: nextDay++, inMonth: false });
  }
  matrix.push(row);

  // ensure 6 rows
  while (matrix.length < 6) {
    const extraRow: Array<{ day: number; inMonth: boolean }> = [];
    for (let i = 0; i < 7; i++) extraRow.push({ day: nextDay++, inMonth: false });
    matrix.push(extraRow);
  }

  return matrix;
}

export default function ScheduleManagement() {
  const navigate = useNavigate();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const handleDayClick = (day: number, inMonth: boolean) => {
    if (inMonth) {
      const monthStr = String(month + 1).padStart(2, "0");
      const dayStr = String(day).padStart(2, "0");
      navigate(`/current-schedule-management/${year}-${monthStr}-${dayStr}`);
    }
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const matrix = getMonthMatrix(year, month);

  const prev = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };

  const next = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  return (
    <div className="schedule-page">
      <h2 className="schedule-title">Current schedule management</h2>

      <div className="calendar-wrapper">
        <div className="calendar">
          <div className="calendar-month">{monthNames[month]}</div>

          <div className="calendar-grid">
            <div className="calendar-weekday">Mon</div>
            <div className="calendar-weekday">Tue</div>
            <div className="calendar-weekday">Wed</div>
            <div className="calendar-weekday">Thu</div>
            <div className="calendar-weekday">Fri</div>
            <div className="calendar-weekday">Sat</div>
            <div className="calendar-weekday">Sun</div>

            {matrix.map((row, ri) => (
              <div className="calendar-row" key={ri}>
                {row.map((cell, ci) => (
                  <div
                    key={ci}
                    className={`day-cell ${cell.inMonth ? "in-month" : "out-month"}`}
                    onClick={() => handleDayClick(cell.day, cell.inMonth)}
                    style={{ cursor: cell.inMonth ? "pointer" : "default" }}>
                    <div className="day-number">{cell.day}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="calendar-actions">
            <button className="calendar-btn" onClick={prev}>Previous month</button>
            <button className="calendar-btn" onClick={next}>Next month</button>
          </div>
        </div>
      </div>
    </div>
  );
}