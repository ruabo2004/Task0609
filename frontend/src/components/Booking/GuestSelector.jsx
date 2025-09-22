import React from "react";

const GuestSelector = ({
  adults = 1,
  children = 0,
  infants = 0,
  maxGuests = 8,
  onChange = () => {},
  disabled = false,
  className = "",
}) => {
  const handleChange = (type, value) => {
    const newValue = Math.max(0, Math.min(maxGuests, value));
    onChange({
      adults: type === "adults" ? newValue : adults,
      children: type === "children" ? newValue : children,
      infants: type === "infants" ? newValue : infants,
    });
  };

  const totalGuests = adults + children + infants;

  const renderCounter = (label, value, type, description) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <div className="font-medium text-gray-900">{label}</div>
        {description && (
          <div className="text-sm text-gray-500">{description}</div>
        )}
      </div>
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={() => handleChange(type, value - 1)}
          disabled={disabled || (type === "adults" && value <= 1) || value <= 0}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 12H4"
            />
          </svg>
        </button>
        <span className="w-8 text-center font-medium">{value}</span>
        <button
          type="button"
          onClick={() => handleChange(type, value + 1)}
          disabled={disabled || totalGuests >= maxGuests}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>
      </div>
    </div>
  );

  return (
    <div
      className={`bg-white border border-gray-300 rounded-lg p-4 ${className}`}
    >
      <div className="space-y-1">
        {renderCounter("Người lớn", adults, "adults", "Từ 13 tuổi trở lên")}

        <div className="border-t border-gray-200" />

        {renderCounter("Trẻ em", children, "children", "Từ 2-12 tuổi")}

        <div className="border-t border-gray-200" />

        {renderCounter("Em bé", infants, "infants", "Dưới 2 tuổi")}
      </div>

      {totalGuests >= maxGuests && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          Đã đạt số lượng khách tối đa ({maxGuests} khách)
        </div>
      )}

      <div className="mt-3 text-sm text-gray-500">
        Tổng: {totalGuests} khách
      </div>
    </div>
  );
};

export default GuestSelector;


