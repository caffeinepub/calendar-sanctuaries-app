import { useState, useMemo } from 'react';

export interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  weekNumber: number;
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function useCalendarState() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

  const currentWeekNumber = getWeekNumber(today);

  const calendarDays = useMemo((): CalendarDay[] => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);

    // Start from Monday (1) or Sunday (0) - we use Sunday as start
    let startDay = firstDayOfMonth.getDay(); // 0=Sun
    // Adjust to start from Monday
    startDay = (startDay + 6) % 7; // 0=Mon, 6=Sun

    const days: CalendarDay[] = [];

    // Previous month days
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(viewYear, viewMonth, -i);
      days.push({
        date,
        dayOfMonth: date.getDate(),
        isCurrentMonth: false,
        isToday: false,
        weekNumber: getWeekNumber(date),
      });
    }

    // Current month days
    for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
      const date = new Date(viewYear, viewMonth, d);
      const isToday =
        d === today.getDate() &&
        viewMonth === today.getMonth() &&
        viewYear === today.getFullYear();
      days.push({
        date,
        dayOfMonth: d,
        isCurrentMonth: true,
        isToday,
        weekNumber: getWeekNumber(date),
      });
    }

    // Next month days to fill grid (6 rows × 7 cols = 42)
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const date = new Date(viewYear, viewMonth + 1, d);
      days.push({
        date,
        dayOfMonth: d,
        isCurrentMonth: false,
        isToday: false,
        weekNumber: getWeekNumber(date),
      });
    }

    return days;
  }, [viewYear, viewMonth, today.getDate(), today.getMonth(), today.getFullYear()]);

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const goToYear = (year: number) => setViewYear(year);
  const goToToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  const monthName = new Date(viewYear, viewMonth, 1).toLocaleString('default', { month: 'long' });

  return {
    viewYear,
    viewMonth,
    monthName,
    calendarDays,
    currentWeekNumber,
    today,
    goToPrevMonth,
    goToNextMonth,
    goToYear,
    goToToday,
  };
}
