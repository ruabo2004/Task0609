import React from "react";

const BookingSteps = ({
  currentStep = 1,
  steps = [],
  className = "",
  orientation = "horizontal",
}) => {
  const defaultSteps = [
    { id: 1, title: "Thông tin", description: "Nhập thông tin cá nhân" },
    { id: 2, title: "Thanh toán", description: "Chọn phương thức thanh toán" },
    { id: 3, title: "Xác nhận", description: "Xác nhận đặt phòng" },
  ];

  const stepList = steps.length > 0 ? steps : defaultSteps;

  const renderStep = (step, index) => {
    const isCompleted = step.id < currentStep;
    const isCurrent = step.id === currentStep;
    const isUpcoming = step.id > currentStep;

    return (
      <div key={step.id} className="flex items-center">
        {/* Step Circle */}
        <div
          className={`
            flex items-center justify-center w-10 h-10 rounded-full border-2 font-medium text-sm
            ${
              isCompleted
                ? "bg-blue-600 border-blue-600 text-white"
                : isCurrent
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-gray-300 text-gray-300 bg-white"
            }
          `}
        >
          {isCompleted ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            step.id
          )}
        </div>

        {/* Step Content */}
        <div className="ml-4 min-w-0">
          <div
            className={`text-sm font-medium ${
              isUpcoming ? "text-gray-400" : "text-gray-900"
            }`}
          >
            {step.title}
          </div>
          {step.description && (
            <div
              className={`text-xs ${
                isUpcoming ? "text-gray-300" : "text-gray-500"
              }`}
            >
              {step.description}
            </div>
          )}
        </div>

        {/* Connector Line */}
        {index < stepList.length - 1 && (
          <div
            className={`flex-1 h-0.5 mx-4 ${
              step.id < currentStep ? "bg-blue-600" : "bg-gray-300"
            }`}
          />
        )}
      </div>
    );
  };

  return (
    <div className={`${className}`}>
      <div
        className={`
          flex items-center
          ${orientation === "vertical" ? "flex-col space-y-4" : ""}
        `}
      >
        {stepList.map((step, index) => renderStep(step, index))}
      </div>
    </div>
  );
};

// Vertical Steps Component
export const VerticalBookingSteps = (props) => (
  <BookingSteps {...props} orientation="vertical" />
);

// Mini Steps Component for mobile
export const MiniBookingSteps = ({ currentStep, totalSteps = 3 }) => (
  <div className="flex items-center space-x-2">
    {[...Array(totalSteps)].map((_, index) => (
      <div
        key={index}
        className={`
          w-2 h-2 rounded-full
          ${
            index + 1 <= currentStep
              ? "bg-blue-600"
              : index + 1 === currentStep
              ? "bg-blue-300"
              : "bg-gray-300"
          }
        `}
      />
    ))}
    <span className="text-xs text-gray-500 ml-2">
      {currentStep}/{totalSteps}
    </span>
  </div>
);

export default BookingSteps;


