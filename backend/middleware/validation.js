const { body, query, param } = require('express-validator');

const customerValidation = {
  register: [
    body('full_name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2 and 100 characters'),
    
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
    body('phone')
      .optional()
      .isMobilePhone('vi-VN')
      .withMessage('Please provide a valid Vietnamese phone number'),
    
    body('address')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Address must not exceed 500 characters'),
    
    body('date_of_birth')
      .optional()
      .isDate()
      .withMessage('Please provide a valid date of birth')
      .custom((value) => {
        if (value) {
          const today = new Date();
          const birthDate = new Date(value);
          const age = today.getFullYear() - birthDate.getFullYear();
          if (age < 16 || age > 120) {
            throw new Error('Age must be between 16 and 120 years');
          }
        }
        return true;
      })
  ],

  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  updateProfile: [
    body('full_name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2 and 100 characters'),
    
    body('phone')
      .optional()
      .isMobilePhone('vi-VN')
      .withMessage('Please provide a valid Vietnamese phone number'),
    
    body('address')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Address must not exceed 500 characters'),
    
    body('date_of_birth')
      .optional()
      .isDate()
      .withMessage('Please provide a valid date of birth')
      .custom((value) => {
        if (value) {
          const today = new Date();
          const birthDate = new Date(value);
          const age = today.getFullYear() - birthDate.getFullYear();
          if (age < 16 || age > 120) {
            throw new Error('Age must be between 16 and 120 years');
          }
        }
        return true;
      })
  ],

  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('Password confirmation does not match new password');
        }
        return true;
      })
  ]
};

const roomValidation = {
  searchRooms: [
    query('checkInDate')
      .optional()
      .isDate()
      .withMessage('Please provide a valid check-in date'),
    
    query('checkOutDate')
      .optional()
      .isDate()
      .withMessage('Please provide a valid check-out date')
      .custom((value, { req }) => {
        if (value && req.query.checkInDate) {
          const checkIn = new Date(req.query.checkInDate);
          const checkOut = new Date(value);
          if (checkOut <= checkIn) {
            throw new Error('Check-out date must be after check-in date');
          }
        }
        return true;
      }),
    
    query('minPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Minimum price must be a positive number'),
    
    query('maxPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Maximum price must be a positive number')
      .custom((value, { req }) => {
        if (value && req.query.minPrice) {
          if (parseFloat(value) < parseFloat(req.query.minPrice)) {
            throw new Error('Maximum price must be greater than minimum price');
          }
        }
        return true;
      }),
    
    query('roomType')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Room type must be a valid positive integer'),
    
    query('maxOccupancy')
      .optional()
      .isInt({ min: 1, max: 20 })
      .withMessage('Maximum occupancy must be between 1 and 20')
  ],

  checkAvailability: [
    param('roomId')
      .isInt({ min: 1 })
      .withMessage('Room ID must be a valid positive integer'),
    
    query('checkInDate')
      .isDate()
      .withMessage('Please provide a valid check-in date'),
    
    query('checkOutDate')
      .isDate()
      .withMessage('Please provide a valid check-out date')
      .custom((value, { req }) => {
        const checkIn = new Date(req.query.checkInDate);
        const checkOut = new Date(value);
        if (checkOut <= checkIn) {
          throw new Error('Check-out date must be after check-in date');
        }
        return true;
      })
  ]
};

const bookingValidation = {
  createBooking: [
    body('room_id')
      .isInt({ min: 1 })
      .withMessage('Room ID must be a valid positive integer'),
    
    body('check_in_date')
      .isDate()
      .withMessage('Please provide a valid check-in date')
      .custom((value) => {
        const checkIn = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (checkIn < today) {
          throw new Error('Check-in date cannot be in the past');
        }
        return true;
      }),
    
    body('check_out_date')
      .isDate()
      .withMessage('Please provide a valid check-out date')
      .custom((value, { req }) => {
        const checkIn = new Date(req.body.check_in_date);
        const checkOut = new Date(value);
        if (checkOut <= checkIn) {
          throw new Error('Check-out date must be after check-in date');
        }
        return true;
      }),
    
    body('number_of_guests')
      .isInt({ min: 1, max: 20 })
      .withMessage('Number of guests must be between 1 and 20'),
    
    body('special_requests')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Special requests must not exceed 1000 characters'),
    
    body('additional_services')
      .optional()
      .isArray()
      .withMessage('Additional services must be an array'),
    
    body('additional_services.*.service_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Service ID must be a valid positive integer'),
    
    body('additional_services.*.quantity')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Service quantity must be between 1 and 100')
  ],

  calculateCost: [
    body('room_id')
      .isInt({ min: 1 })
      .withMessage('Room ID must be a valid positive integer'),
    
    body('check_in_date')
      .isDate()
      .withMessage('Please provide a valid check-in date'),
    
    body('check_out_date')
      .isDate()
      .withMessage('Please provide a valid check-out date')
      .custom((value, { req }) => {
        const checkIn = new Date(req.body.check_in_date);
        const checkOut = new Date(value);
        if (checkOut <= checkIn) {
          throw new Error('Check-out date must be after check-in date');
        }
        return true;
      }),
    
    body('number_of_guests')
      .isInt({ min: 1, max: 20 })
      .withMessage('Number of guests must be between 1 and 20'),
    
    body('additional_services')
      .optional()
      .isArray()
      .withMessage('Additional services must be an array')
  ]
};

const generalValidation = {
  idParam: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID must be a valid positive integer')
  ],

  roomIdParam: [
    param('roomId')
      .isInt({ min: 1 })
      .withMessage('Room ID must be a valid positive integer')
  ],

  bookingIdParam: [
    param('bookingId')
      .isInt({ min: 1 })
      .withMessage('Booking ID must be a valid positive integer')
  ],

  pagination: [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Offset must be a non-negative integer')
  ]
};

const paymentValidation = {
  createMoMoPayment: [
    body('booking_id')
      .isInt({ min: 1 })
      .withMessage('Booking ID must be a valid positive integer')
  ]
};

module.exports = {
  customerValidation,
  roomValidation,
  bookingValidation,
  paymentValidation,
  generalValidation
};
