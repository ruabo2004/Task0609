const express = require("express");
const router = express.Router();
const momoController = require("../controllers/momoController");
const { authenticate } = require("../middleware/auth");

/**
 * @route   POST /api/payments/momo/create
 * @desc    Create MoMo payment URL
 * @access  Private
 */
router.post("/create", authenticate, momoController.createPayment);

/**
 * @route   GET /api/payments/momo/callback
 * @desc    Handle MoMo callback (redirect)
 * @access  Public
 */
router.get("/callback", momoController.handleCallback);

/**
 * @route   POST /api/payments/momo/ipn
 * @desc    Handle MoMo IPN (notification)
 * @access  Public
 */
router.post("/ipn", momoController.handleIPN);

/**
 * @route   GET /api/payments/momo/status/:orderId
 * @desc    Check payment status
 * @access  Private
 */
router.get("/status/:orderId", authenticate, momoController.checkStatus);

module.exports = router;

