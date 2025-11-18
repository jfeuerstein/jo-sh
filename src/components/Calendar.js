import React, { useState } from 'react';
import './Calendar.css';
import { loadDailyData } from '../utils/storage';

function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const dailyData = loadDailyData();

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getCompletionLevel = (dateStr) => {
    const data = dailyData[dateStr];
    if (!data || data.completed.length === 0) return 0;

    // Return number of tasks completed (we'll use this for intensity)
    return data.completed.length;
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const days = [];
  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day empty" />);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const completionLevel = getCompletionLevel(dateStr);
    const isToday = dateStr === new Date().toISOString().split('T')[0];

    days.push(
      <div
        key={day}
        className={`calendar-day ${completionLevel > 0 ? 'completed' : ''} ${isToday ? 'today' : ''}`}
        data-level={Math.min(completionLevel, 4)}
        title={completionLevel > 0 ? `${completionLevel} task${completionLevel > 1 ? 's' : ''} completed` : 'no tasks completed'}
      >
        {day}
      </div>
    );
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button className="calendar-nav" onClick={goToPreviousMonth}>
          ←
        </button>
        <div className="calendar-title">{monthName}</div>
        <button className="calendar-nav" onClick={goToNextMonth}>
          →
        </button>
      </div>
      <button className="calendar-today-btn" onClick={goToToday}>
        [ today ]
      </button>
      <div className="calendar-weekdays">
        <div>sun</div>
        <div>mon</div>
        <div>tue</div>
        <div>wed</div>
        <div>thu</div>
        <div>fri</div>
        <div>sat</div>
      </div>
      <div className="calendar-grid">{days}</div>
      <div className="calendar-legend">
        <span className="legend-label">less</span>
        <div className="legend-boxes">
          <div className="legend-box" data-level="0" />
          <div className="legend-box" data-level="1" />
          <div className="legend-box" data-level="2" />
          <div className="legend-box" data-level="3" />
          <div className="legend-box" data-level="4" />
        </div>
        <span className="legend-label">more</span>
      </div>
    </div>
  );
}

export default Calendar;
