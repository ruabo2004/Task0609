const express = require("express");
const router = express.Router();
const { contactController } = require("../controllers");
const { authenticate, authorize } = require("../middleware");

/**
 * @route   GET /api/contacts
 * @desc    Get all contact form submissions (Admin only)
 * @access  Private/Admin
 */
router.get(
  "/",
  authenticate,
  authorize("admin"),
  contactController.getAllContacts
);

/**
 * @route   GET /api/contacts/:id
 * @desc    Get contact form submission by ID (Admin only)
 * @access  Private/Admin
 */
router.get(
  "/:id",
  authenticate,
  authorize("admin"),
  contactController.getContactById
);

/**
 * @route   POST /api/contacts
 * @desc    Create new contact form submission (Public)
 * @access  Public
 */
router.post("/", contactController.createContact);

/**
 * @route   PUT /api/contacts/:id
 * @desc    Update contact form submission (Admin only)
 * @access  Private/Admin
 */
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  contactController.updateContact
);

/**
 * @route   DELETE /api/contacts/:id
 * @desc    Delete contact form submission (Admin only)
 * @access  Private/Admin
 */
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  contactController.deleteContact
);

module.exports = router;
