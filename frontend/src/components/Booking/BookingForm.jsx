import React, { useState } from "react";

const BookingForm = ({
  roomId,
  roomData = {},
  initialData = {},
  onSuccess = () => {},
  onCancel = () => {},
  onError = () => {},
  className = "",
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Mock booking submission
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock success response
      const mockBookingResult = {
        booking: {
          booking_id: "BK123456",
          room_number: roomData.room_number,
          confirmation_code: "ABC123",
          status: "confirmed",
        },
        payment: {
          method: "credit_card",
          status: "paid",
        },
      };

      onSuccess(mockBookingResult);
    } catch (error) {
      onError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Form đặt phòng
      </h2>

      <div className="text-center text-gray-600 mb-6">
        <p>Booking form đang được phát triển...</p>
        <p className="mt-2">Vui lòng quay lại sau!</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Họ và tên
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập họ và tên"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập địa chỉ email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại
            </label>
            <input
              type="tel"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập số điện thoại"
              required
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Đang xử lý..." : "Đặt phòng"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;


