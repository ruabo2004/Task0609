const crypto = require("crypto");
const axios = require("axios");
const { executeQuery } = require("../config/database");
const { success, error } = require("../utils/responseHelper");

// MoMo Configuration
const config = {
  partnerCode: process.env.MOMO_PARTNER_CODE || "MOMOBKUN20180529",
  accessKey: process.env.MOMO_ACCESS_KEY || "klm05TvNBzhg7h7j",
  secretKey: process.env.MOMO_SECRET_KEY || "at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa",
  endpoint: "https://test-payment.momo.vn/v2/gateway/api/create",
  redirectUrl:
    process.env.MOMO_REDIRECT_URL ||
    "http://localhost:5000/api/payments/momo/callback",
  ipnUrl:
    process.env.MOMO_IPN_URL || "http://localhost:5000/api/payments/momo/ipn",
};

const momoController = {
  /**
   * Create MoMo payment request
   * @route POST /api/payments/momo/create
   */
  createPayment: async (req, res, next) => {
    try {
      const { bookingId, amount, orderInfo, requestType } = req.body;

      // Validate input
      if (!bookingId || !amount) {
        return error(res, "Booking ID and amount are required", 400);
      }

      // Get booking details
      const [booking] = await executeQuery(
        "SELECT * FROM bookings WHERE id = ?",
        [bookingId]
      );

      if (!booking) {
        return error(res, "Booking not found", 404);
      }

      // Generate request ID and order ID
      const orderId = `${config.partnerCode}_${Date.now()}`;
      const requestId = orderId;
      const orderInfoText = orderInfo || `Thanh toán đặt phòng #${bookingId}`;
      const amountInt = parseInt(amount);

      console.log("💰 MoMo Payment Details:", {
        bookingId,
        originalAmount: amount,
        parsedAmount: amountInt,
        orderInfo: orderInfoText,
      });

      // Request body for MoMo
      // requestType: 'captureWallet' for QR/App, 'payWithATM' for ATM/Card
      const momoRequestType = requestType || "captureWallet";

      const requestBody = {
        partnerCode: config.partnerCode,
        accessKey: config.accessKey,
        requestId: requestId,
        amount: amountInt.toString(),
        orderId: orderId,
        orderInfo: orderInfoText,
        redirectUrl: config.redirectUrl,
        ipnUrl: config.ipnUrl,
        extraData: JSON.stringify({ bookingId }),
        requestType: momoRequestType,
        lang: "vi",
      };

      // Create signature
      const rawSignature = `accessKey=${config.accessKey}&amount=${requestBody.amount}&extraData=${requestBody.extraData}&ipnUrl=${config.ipnUrl}&orderId=${orderId}&orderInfo=${orderInfoText}&partnerCode=${config.partnerCode}&redirectUrl=${config.redirectUrl}&requestId=${requestId}&requestType=${momoRequestType}`;

      const signature = crypto
        .createHmac("sha256", config.secretKey)
        .update(rawSignature)
        .digest("hex");

      requestBody.signature = signature;

      console.log("📱 MoMo Payment Request:", {
        orderId,
        amount: amountInt,
        orderInfo: orderInfoText,
        requestType: momoRequestType,
        signature: signature.substring(0, 20) + "...",
      });

      // Send request to MoMo
      const momoResponse = await axios.post(config.endpoint, requestBody, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (momoResponse.data.resultCode === 0) {
        // Create payment record
        await executeQuery(
          `INSERT INTO payments (booking_id, amount, payment_method, payment_status, transaction_id, notes, created_at)
           VALUES (?, ?, 'momo', 'pending', ?, ?, NOW())`,
          [
            bookingId,
            amountInt,
            orderId,
            `MoMo payment for booking #${bookingId}`,
          ]
        );

        // Return payment URL to frontend
        return success(
          res,
          {
            payment_url: momoResponse.data.payUrl,
            payUrl: momoResponse.data.payUrl,
            orderId: orderId,
            requestId: requestId,
            message: momoResponse.data.message,
          },
          "Payment URL created successfully"
        );
      } else {

        // Fallback: Create a direct MoMo QR payment URL
        const qrPaymentUrl = `https://test-payment.momo.vn/v2/gateway/pay?partnerCode=${
          config.partnerCode
        }&orderId=${orderId}&requestId=${requestId}&amount=${amountInt}&orderInfo=${encodeURIComponent(
          orderInfoText
        )}&redirectUrl=${encodeURIComponent(
          config.redirectUrl
        )}&ipnUrl=${encodeURIComponent(
          config.ipnUrl
        )}&extraData=${encodeURIComponent(
          JSON.stringify({ bookingId })
        )}&requestType=captureWallet&lang=vi`;

        // Create payment record anyway for testing
        await executeQuery(
          `INSERT INTO payments (booking_id, amount, payment_method, payment_status, transaction_id, notes, created_at)
           VALUES (?, ?, 'momo', 'pending', ?, ?, NOW())`,
          [
            bookingId,
            amountInt,
            orderId,
            `MoMo payment for booking #${bookingId} (Test Mode)`,
          ]
        );

        return success(
          res,
          {
            payment_url: qrPaymentUrl,
            payUrl: qrPaymentUrl,
            orderId: orderId,
            requestId: requestId,
            message: "MoMo QR payment URL created",
            test_mode: true,
          },
          "MoMo QR payment URL created successfully"
        );
      }
    } catch (err) {
      console.error("❌ MoMo Payment Error:", err);
      next(err);
    }
  },

  /**
   * Handle MoMo callback (redirect from MoMo)
   * @route GET /api/payments/momo/callback
   */
  handleCallback: async (req, res, next) => {
    try {
      const {
        orderId,
        requestId,
        amount,
        orderInfo,
        orderType,
        transId,
        resultCode,
        message,
        payType,
        responseTime,
        extraData,
        signature,
      } = req.query;

      console.log("📱 MoMo Callback Received:", {
        orderId,
        resultCode,
        message,
        transId,
      });

      // Verify signature
      const rawSignature = `accessKey=${config.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${config.partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

      const expectedSignature = crypto
        .createHmac("sha256", config.secretKey)
        .update(rawSignature)
        .digest("hex");

      if (signature !== expectedSignature) {
        console.error("❌ Invalid signature");
        return res.redirect(
          `http://localhost:5173/payment/failed?reason=invalid_signature`
        );
      }

      // Parse extraData to get bookingId
      let bookingId;
      try {
        const extra = JSON.parse(extraData);
        bookingId = extra.bookingId;
      } catch (e) {
        console.error("Failed to parse extraData:", e);
      }

      if (resultCode === "0") {
        // Payment successful
        if (bookingId) {
          // Update payment status
          await executeQuery(
            `UPDATE payments 
             SET payment_status = 'completed', transaction_id = ?, updated_at = NOW()
             WHERE transaction_id = ? OR (booking_id = ? AND payment_method = 'momo')`,
            [transId, orderId, bookingId]
          );

          // Update booking status
          await executeQuery(
            `UPDATE bookings SET status = 'confirmed', updated_at = NOW() WHERE id = ?`,
            [bookingId]
          );
        }

        return res.redirect(
          `http://localhost:5173/payment/success?bookingId=${bookingId}&transId=${transId}`
        );
      } else {
        // Payment failed
        if (bookingId) {
          await executeQuery(
            `UPDATE payments 
             SET payment_status = 'failed', notes = ?, updated_at = NOW()
             WHERE transaction_id = ? OR (booking_id = ? AND payment_method = 'momo')`,
            [message, orderId, bookingId]
          );
        }

        return res.redirect(
          `http://localhost:5173/payment/failed?reason=${message}`
        );
      }
    } catch (err) {
      console.error("❌ Callback Error:", err);
      return res.redirect(
        "http://localhost:5173/payment/failed?reason=server_error"
      );
    }
  },

  /**
   * Handle MoMo IPN (notification from MoMo server)
   * @route POST /api/payments/momo/ipn
   */
  handleIPN: async (req, res, next) => {
    try {
      const {
        orderId,
        requestId,
        amount,
        orderInfo,
        orderType,
        transId,
        resultCode,
        message,
        payType,
        responseTime,
        extraData,
        signature,
      } = req.body;

      console.log("📱 MoMo IPN Received:", {
        orderId,
        resultCode,
        message,
        transId,
      });

      // Verify signature
      const rawSignature = `accessKey=${config.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${config.partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

      const expectedSignature = crypto
        .createHmac("sha256", config.secretKey)
        .update(rawSignature)
        .digest("hex");

      if (signature !== expectedSignature) {
        console.error("❌ Invalid IPN signature");
        return res.status(400).json({ message: "Invalid signature" });
      }

      // Parse extraData to get bookingId
      let bookingId;
      try {
        const extra = JSON.parse(extraData);
        bookingId = extra.bookingId;
      } catch (e) {
        console.error("Failed to parse extraData:", e);
      }

      if (resultCode === 0) {
        // Payment successful
        if (bookingId) {
          await executeQuery(
            `UPDATE payments 
             SET payment_status = 'completed', transaction_id = ?, updated_at = NOW()
             WHERE transaction_id = ? OR (booking_id = ? AND payment_method = 'momo')`,
            [transId, orderId, bookingId]
          );

          await executeQuery(
            `UPDATE bookings SET status = 'confirmed', updated_at = NOW() WHERE id = ?`,
            [bookingId]
          );
        }

      } else {
        // Payment failed
        if (bookingId) {
          await executeQuery(
            `UPDATE payments 
             SET payment_status = 'failed', notes = ?, updated_at = NOW()
             WHERE transaction_id = ? OR (booking_id = ? AND payment_method = 'momo')`,
            [message, orderId, bookingId]
          );
        }

      }

      // Respond to MoMo
      return res.status(200).json({
        message: "IPN received successfully",
      });
    } catch (err) {
      console.error("❌ IPN Error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  /**
   * Check payment status
   * @route GET /api/payments/momo/status/:orderId
   */
  checkStatus: async (req, res, next) => {
    try {
      const { orderId } = req.params;

      const requestId = orderId;
      const rawSignature = `accessKey=${config.accessKey}&orderId=${orderId}&partnerCode=${config.partnerCode}&requestId=${requestId}`;

      const signature = crypto
        .createHmac("sha256", config.secretKey)
        .update(rawSignature)
        .digest("hex");

      const requestBody = {
        partnerCode: config.partnerCode,
        accessKey: config.accessKey,
        requestId: requestId,
        orderId: orderId,
        signature: signature,
        lang: "vi",
      };

      const momoResponse = await axios.post(
        "https://test-payment.momo.vn/v2/gateway/api/query",
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return success(res, momoResponse.data, "Payment status retrieved");
    } catch (err) {
      console.error("❌ Status Check Error:", err);
      next(err);
    }
  },
};

module.exports = momoController;
