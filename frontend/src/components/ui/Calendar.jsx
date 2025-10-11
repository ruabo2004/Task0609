import React, { useState, useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

/**
 * Calendar component with date range selection and disabled dates
 */
const Calendar = ({
  selectedStartDate,
  selectedEndDate,
  onDateSelect,
  disabledDates = [],
  bookedRanges = [],
  minDate,
  maxDate,
  className = '',
}) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = selectedStartDate ? new Date(selectedStartDate) : new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month and last day
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Days from previous month to fill the first week
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // Generate 42 days (6 weeks)
    const days = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  }, [currentMonth]);

  // Helper functions
  const formatDate = (date) => {
    // Sử dụng local timezone thay vì UTC để tránh lỗi múi giờ
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isSameDate = (date1, date2) => {
    return formatDate(date1) === formatDate(date2);
  };

  const isDateDisabled = (date) => {
    const dateStr = formatDate(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Disable past dates
    if (date < today) return true;
    
    // Disable if in disabledDates array
    if (disabledDates.includes(dateStr)) return true;
    
    // Disable if within booked ranges
    return bookedRanges.some(range => {
      const start = new Date(range.start);
      const end = new Date(range.end);
      return date >= start && date < end;
    });
  };

  const isInSelectedRange = (date) => {
    if (!selectedStartDate || !selectedEndDate) return false;
    const start = new Date(selectedStartDate);
    const end = new Date(selectedEndDate);
    
    // Highlight all dates in the selected range
    return date >= start && date <= end;
  };

  const isStartDate = (date) => {
    return selectedStartDate && isSameDate(date, new Date(selectedStartDate));
  };

  const isEndDate = (date) => {
    return selectedEndDate && isSameDate(date, new Date(selectedEndDate));
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const isToday = (date) => {
    const today = new Date();
    return isSameDate(date, today);
  };

  const isBookedDate = (date) => {
    const dateStr = formatDate(date);
    return disabledDates.includes(dateStr);
  };

  // Handle date click - Allow multiple days selection
  const handleDateClick = (date) => {
    if (isDateDisabled(date)) return;
    
    const dateStr = formatDate(date);
    
    if (!selectedStartDate) {
      // First selection - set start date
      onDateSelect({ startDate: dateStr, endDate: null });
    } else if (selectedStartDate && !selectedEndDate) {
      // Second selection - set end date (any date after start)
      const start = new Date(selectedStartDate);
      
      if (date > start) {
        // Valid end date selection
        onDateSelect({ startDate: selectedStartDate, endDate: dateStr });
      } else {
        // Reset selection with new start date
        onDateSelect({ startDate: dateStr, endDate: null });
      }
    } else {
      // Reset selection with new start date
      onDateSelect({ startDate: dateStr, endDate: null });
    }
  };

  // Navigation
  const goToPrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevMonth}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
        </button>
        
        <h3 className="text-lg font-semibold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        
        <button
          onClick={goToNextMonth}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <ChevronRightIcon className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          const disabled = isDateDisabled(date);
          const inRange = isInSelectedRange(date);
          const isStart = isStartDate(date);
          const isEnd = isEndDate(date);
          const currentMonthDay = isCurrentMonth(date);
          const todayDate = isToday(date);
          const booked = isBookedDate(date);

          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              disabled={disabled}
              className={`
                h-10 w-10 text-sm rounded-lg transition-all duration-200
                ${!currentMonthDay 
                  ? 'text-gray-300' 
                  : disabled && booked
                    ? 'bg-red-500 text-white cursor-not-allowed font-semibold line-through' 
                    : disabled 
                      ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                      : 'text-gray-700 hover:bg-blue-50'
                }
                ${todayDate && !disabled ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                ${isStart || isEnd ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                ${inRange && !isStart && !isEnd ? 'bg-blue-100 text-blue-700' : ''}
                ${!disabled && currentMonthDay ? 'hover:scale-105' : ''}
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>Đã có người đặt</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-600 rounded"></div>
          <span>Ngày nhận/trả phòng</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-100 rounded"></div>
          <span>Khoảng thời gian đã chọn</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-100 rounded"></div>
          <span>Không khả dụng</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
