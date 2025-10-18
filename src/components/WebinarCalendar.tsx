'use client';

import { useState, useEffect } from 'react';

interface WebinarCalendarProps {
  webinars: Array<{
    id: string;
    scheduledDate: string;
    title: string;
  }>;
}

export default function WebinarCalendar({ webinars }: WebinarCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const hasWebinar = (day: number) => {
    const dateToCheck = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );

    return webinars.some(webinar => {
      const webinarDate = new Date(webinar.scheduledDate);
      return (
        webinarDate.getDate() === day &&
        webinarDate.getMonth() === currentDate.getMonth() &&
        webinarDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);

  const days = [];
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(
      <div key={`empty-${i}`} className='text-center py-2 text-sm'></div>
    );
  }
  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(
      <button
        key={day}
        className={`text-center py-2 text-sm rounded transition-colors ${
          isToday(day)
            ? 'bg-green-500 text-white font-semibold'
            : hasWebinar(day)
              ? 'bg-green-100 text-green-800 font-medium hover:bg-green-200'
              : 'text-gray-700 hover:bg-gray-100'
        }`}
        title={
          hasWebinar(day)
            ? `Webinar on ${monthNames[currentDate.getMonth()]} ${day}`
            : ''
        }
      >
        {day}
      </button>
    );
  }

  return (
    <div className='mb-6'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-gray-900'>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className='flex space-x-1'>
          <button
            onClick={previousMonth}
            className='p-1 hover:bg-gray-100 rounded transition-colors'
            aria-label='Previous month'
          >
            <svg
              className='w-4 h-4 text-gray-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 19l-7-7 7-7'
              />
            </svg>
          </button>
          <button
            onClick={nextMonth}
            className='p-1 hover:bg-gray-100 rounded transition-colors'
            aria-label='Next month'
          >
            <svg
              className='w-4 h-4 text-gray-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 5l7 7-7 7'
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className='grid grid-cols-7 gap-1 mb-2'>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div
            key={day}
            className='text-center text-sm font-medium text-gray-500 py-2'
          >
            {day}
          </div>
        ))}
      </div>

      <div className='grid grid-cols-7 gap-1'>{days}</div>

      {/* Legend */}
      <div className='mt-4 text-xs text-gray-600 space-y-1'>
        <div className='flex items-center'>
          <div className='w-3 h-3 bg-green-500 rounded mr-2'></div>
          <span>Today</span>
        </div>
        <div className='flex items-center'>
          <div className='w-3 h-3 bg-green-100 border border-green-200 rounded mr-2'></div>
          <span>Webinar scheduled</span>
        </div>
      </div>
    </div>
  );
}
