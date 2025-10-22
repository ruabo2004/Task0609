// Job để tự động hủy các đơn đặt phòng "Thanh toán sau" quá 5 phút
const { executeQuery } = require("../config/database");
const { Booking } = require("../models");

/**
 * Hủy các đơn đặt phòng "Thanh toán sau" đã quá 5 phút mà chưa thanh toán
 */
const cancelExpiredPayLaterBookings = async () => {
  try {
    console.log("🔄 [CRON] Đang kiểm tra các đơn thanh toán sau quá hạn...");

    // Tìm các payment "pay_later" đã quá 5 phút và vẫn ở trạng thái pending
    const query = `
      SELECT p.*, b.id as booking_id, b.status as booking_status, b.user_id
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      WHERE p.payment_method = 'pay_later'
        AND p.payment_status = 'pending'
        AND b.status = 'pending'
        AND TIMESTAMPDIFF(MINUTE, p.created_at, NOW()) >= 5
    `;

    const expiredPayments = await executeQuery(query);

    if (expiredPayments.length === 0) {
      console.log("✅ [CRON] Không có đơn thanh toán sau quá hạn");
      return;
    }

    console.log(
      `⚠️ [CRON] Tìm thấy ${expiredPayments.length} đơn thanh toán sau quá hạn`
    );

    // Hủy từng booking
    for (const payment of expiredPayments) {
      try {
        // Cập nhật trạng thái payment thành cancelled
        await executeQuery(
          `UPDATE payments SET payment_status = 'cancelled', notes = CONCAT(notes, ' - Tự động hủy sau 5 phút') WHERE id = ?`,
          [payment.id]
        );

        // Hủy booking
        const booking = await Booking.findById(payment.booking_id);
        if (booking && booking.status === "pending") {
          await booking.cancel();
          console.log(
            `✅ [CRON] Đã hủy booking #${payment.booking_id} do quá hạn thanh toán sau`
          );
        }
      } catch (error) {
        console.error(
          `❌ [CRON] Lỗi khi hủy booking #${payment.booking_id}:`,
          error.message
        );
      }
    }

    console.log(
      `✅ [CRON] Đã xử lý xong ${expiredPayments.length} đơn thanh toán sau quá hạn`
    );
  } catch (error) {
    console.error("❌ [CRON] Lỗi khi chạy job hủy thanh toán sau:", error);
  }
};

module.exports = { cancelExpiredPayLaterBookings };
