// Contact Controller
// Handles contact form submissions

const { executeQuery } = require("../config/database");
const {
  success,
  error,
  created,
  notFound,
  paginated,
} = require("../utils/responseHelper");

const contactController = {
  // @desc    Get all contact form submissions (Admin only)
  // @route   GET /api/contacts
  // @access  Private/Admin
  getAllContacts: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // Get total count
      const countResult = await executeQuery(
        "SELECT COUNT(*) as total FROM contacts"
      );
      const total = countResult[0].total;

      // Get contacts with pagination
      const contacts = await executeQuery(
        `SELECT * FROM contacts 
         ORDER BY created_at DESC 
         LIMIT ${limit} OFFSET ${offset}`
      );

      return paginated(
        res,
        contacts,
        {
          page,
          totalPages: Math.ceil(total / limit),
          total,
          limit,
        },
        "Contacts retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get contact form submission by ID
  // @route   GET /api/contacts/:id
  // @access  Private/Admin
  getContactById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const contacts = await executeQuery(
        "SELECT * FROM contacts WHERE id = ?",
        [id]
      );

      if (contacts.length === 0) {
        return notFound(res, "Contact not found");
      }

      return success(res, contacts[0], "Contact retrieved successfully");
    } catch (err) {
      next(err);
    }
  },

  // @desc    Create new contact form submission
  // @route   POST /api/contacts
  // @access  Public
  createContact: async (req, res, next) => {
    try {
      const { name, email, phone, subject, message } = req.body;

      // Basic validation
      if (!name || !email || !subject || !message) {
        return error(res, "Vui lòng điền đầy đủ thông tin", 400);
      }

      const result = await executeQuery(
        `INSERT INTO contacts (name, email, phone, subject, message, status) 
         VALUES (?, ?, ?, ?, ?, 'unread')`,
        [name, email, phone, subject, message]
      );

      const newContact = await executeQuery(
        "SELECT * FROM contacts WHERE id = ?",
        [result.insertId]
      );

      return created(
        res,
        newContact[0],
        "Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể."
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Update contact form submission
  // @route   PUT /api/contacts/:id
  // @access  Private/Admin
  updateContact: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      // Check if contact exists
      const contacts = await executeQuery(
        "SELECT * FROM contacts WHERE id = ?",
        [id]
      );

      if (contacts.length === 0) {
        return notFound(res, "Contact not found");
      }

      // Update contact
      const updateFields = [];
      const updateValues = [];

      if (status) {
        updateFields.push("status = ?");
        updateValues.push(status);
      }

      if (notes !== undefined) {
        updateFields.push("notes = ?");
        updateValues.push(notes);
      }

      if (updateFields.length === 0) {
        return error(res, "No fields to update", 400);
      }

      updateValues.push(id);

      await executeQuery(
        `UPDATE contacts SET ${updateFields.join(", ")} WHERE id = ?`,
        updateValues
      );

      const updatedContact = await executeQuery(
        "SELECT * FROM contacts WHERE id = ?",
        [id]
      );

      return success(res, updatedContact[0], "Contact updated successfully");
    } catch (err) {
      next(err);
    }
  },

  // @desc    Delete contact form submission
  // @route   DELETE /api/contacts/:id
  // @access  Private/Admin
  deleteContact: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Check if contact exists
      const contacts = await executeQuery(
        "SELECT * FROM contacts WHERE id = ?",
        [id]
      );

      if (contacts.length === 0) {
        return notFound(res, "Contact not found");
      }

      await executeQuery("DELETE FROM contacts WHERE id = ?", [id]);

      return success(res, null, "Contact deleted successfully");
    } catch (err) {
      next(err);
    }
  },
};

module.exports = contactController;
