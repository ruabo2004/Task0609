import React, { useState } from "react";

const DatePicker = ({
  selectedDate = null,
  onChange = () => {},
  minDate = null,
  maxDate = null,
  disabled = false,
  placeholder = "Chọn ngày",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (date) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("vi-VN").format(new Date(date));
  };

  const handleDateChange = (e) => {
    const value = e.target.value;
    if (value) {
      onChange(new Date(value));
    } else {
      onChange(null);
    }
    setIsOpen(false);
  };

  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          type="date"
          value={formatDateForInput(selectedDate)}
          onChange={handleDateChange}
          min={minDate ? formatDateForInput(minDate) : undefined}
          max={maxDate ? formatDateForInput(maxDate) : undefined}
          disabled={disabled}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder={placeholder}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>

      {selectedDate && (
        <div className="mt-1 text-sm text-gray-600">
          Đã chọn: {formatDate(selectedDate)}
        </div>
      )}
    </div>
  );
};

// Date Range Picker Component
export const DateRangePicker = ({
  startDate = null,
  endDate = null,
  onChange = () => {},
  minDate = null,
  maxDate = null,
  disabled = false,
  className = "",
}) => {
  const handleStartDateChange = (date) => {
    onChange({ startDate: date, endDate });
  };

  const handleEndDateChange = (date) => {
    onChange({ startDate, endDate: date });
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      <DatePicker
        selectedDate={startDate}
        onChange={handleStartDateChange}
        minDate={minDate}
        maxDate={endDate || maxDate}
        disabled={disabled}
        placeholder="Ngày bắt đầu"
      />
      <DatePicker
        selectedDate={endDate}
        onChange={handleEndDateChange}
        minDate={startDate || minDate}
        maxDate={maxDate}
        disabled={disabled}
        placeholder="Ngày kết thúc"
      />
    </div>
  );
};

// Single Date Picker (alias)
export const SingleDatePicker = DatePicker;

// Check-in/Check-out Picker
export const CheckInOutPicker = ({
  checkInDate = null,
  checkOutDate = null,
  onChange = () => {},
  className = "",
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleCheckInChange = (date) => {
    onChange({ checkInDate: date, checkOutDate });
  };

  const handleCheckOutChange = (date) => {
    onChange({ checkInDate, checkOutDate: date });
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ngày nhận phòng
        </label>
        <DatePicker
          selectedDate={checkInDate}
          onChange={handleCheckInChange}
          minDate={today}
          maxDate={checkOutDate}
          placeholder="Chọn ngày nhận phòng"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ngày trả phòng
        </label>
        <DatePicker
          selectedDate={checkOutDate}
          onChange={handleCheckOutChange}
          minDate={checkInDate || today}
          placeholder="Chọn ngày trả phòng"
        />
      </div>
    </div>
  );
};

export default DatePicker;


