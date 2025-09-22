import React from "react";
import { AlertCircle, X } from "lucide-react";
import { clsx } from "clsx";

/**
 * Form Error Component
 * Displays error messages with consistent styling
 */
const FormError = ({
  error,
  errors = [],
  title = "Có lỗi xảy ra",
  dismissible = false,
  onDismiss,
  className = "",
  variant = "danger",
}) => {
  // Don't render if no errors
  if (!error && (!errors || errors.length === 0)) {
    return null;
  }

  const errorList = error ? [error] : errors;

  const variantClasses = {
    danger: "bg-danger-50 border-danger-200 text-danger-800",
    warning: "bg-warning-50 border-warning-200 text-warning-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  const iconVariants = {
    danger: "text-danger-400",
    warning: "text-warning-400",
    info: "text-blue-400",
  };

  return (
    <div
      className={clsx(
        "border rounded-lg p-4 animate-slide-down",
        variantClasses[variant],
        className
      )}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className={clsx("h-5 w-5", iconVariants[variant])} />
        </div>

        <div className="ml-3 flex-1">
          {errorList.length === 1 ? (
            <p className="text-sm font-medium">{errorList[0]}</p>
          ) : (
            <>
              <h3 className="text-sm font-medium mb-2">{title}</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {errorList.map((errorItem, index) => (
                  <li key={index}>
                    {typeof errorItem === "object"
                      ? errorItem.message
                      : errorItem}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {dismissible && onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onDismiss}
                className={clsx(
                  "inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2",
                  variant === "danger" &&
                    "text-danger-500 hover:bg-danger-100 focus:ring-danger-600",
                  variant === "warning" &&
                    "text-warning-500 hover:bg-warning-100 focus:ring-warning-600",
                  variant === "info" &&
                    "text-blue-500 hover:bg-blue-100 focus:ring-blue-600"
                )}
              >
                <span className="sr-only">Đóng</span>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormError;
