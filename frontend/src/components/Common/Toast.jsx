import React from "react";
import { toast, ToastContainer } from "react-toastify";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";
import { clsx } from "clsx";
import "react-toastify/dist/ReactToastify.css";

/**
 * Custom Toast Component with beautiful styling
 */
const CustomToast = ({ type, message, closeToast }) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const colors = {
    success: "text-success-600",
    error: "text-danger-600",
    warning: "text-warning-600",
    info: "text-blue-600",
  };

  const Icon = icons[type];

  return (
    <div className="flex items-center p-4">
      <div className="flex-shrink-0">
        <Icon className={clsx("h-5 w-5", colors[type])} />
      </div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium text-gray-900">{message}</p>
      </div>
      <div className="ml-4 flex-shrink-0">
        <button
          onClick={closeToast}
          className="text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

/**
 * Toast utility functions
 */
export const showToast = {
  success: (message, options = {}) => {
    toast.success(
      ({ closeToast }) => (
        <CustomToast type="success" message={message} closeToast={closeToast} />
      ),
      {
        className: "bg-white border-l-4 border-success-500 shadow-lg",
        bodyClassName: "p-0",
        hideProgressBar: true,
        closeButton: false,
        ...options,
      }
    );
  },

  error: (message, options = {}) => {
    toast.error(
      ({ closeToast }) => (
        <CustomToast type="error" message={message} closeToast={closeToast} />
      ),
      {
        className: "bg-white border-l-4 border-danger-500 shadow-lg",
        bodyClassName: "p-0",
        hideProgressBar: true,
        closeButton: false,
        autoClose: false, // Keep error messages longer
        ...options,
      }
    );
  },

  warning: (message, options = {}) => {
    toast.warning(
      ({ closeToast }) => (
        <CustomToast type="warning" message={message} closeToast={closeToast} />
      ),
      {
        className: "bg-white border-l-4 border-warning-500 shadow-lg",
        bodyClassName: "p-0",
        hideProgressBar: true,
        closeButton: false,
        ...options,
      }
    );
  },

  info: (message, options = {}) => {
    toast.info(
      ({ closeToast }) => (
        <CustomToast type="info" message={message} closeToast={closeToast} />
      ),
      {
        className: "bg-white border-l-4 border-blue-500 shadow-lg",
        bodyClassName: "p-0",
        hideProgressBar: true,
        closeButton: false,
        ...options,
      }
    );
  },
};

/**
 * Toast Container Component
 */
export const ToastProvider = ({ children }) => {
  return (
    <>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="mt-16"
        toastClassName="rounded-lg shadow-lg mb-2"
        bodyClassName="text-sm"
      />
    </>
  );
};

export default CustomToast;
