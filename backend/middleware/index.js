const { authenticate, authorize } = require("./auth");
const validation = require("./validation");
const { uploadUserAvatar, uploadRoomImages } = require("./upload");
const errorHandler = require("./errorHandler");
const notFound = require("./notFound");

// Create validation objects for different modules
const userValidation = {
  register: validation.validateRegister,
  login: validation.validateLogin,
  updateProfile: validation.validateUpdateProfile,
  changePassword: validation.validateChangePassword,
  forgotPassword: validation.validateForgotPassword,
  resetPassword: validation.validateResetPassword,
  createUser: validation.validateCreateUser,
  updateUser: validation.validateUpdateUser,
};

const roomValidation = {
  createRoom: validation.validateCreateRoom,
  updateRoom: validation.validateUpdateRoom,
  checkAvailability: validation.validateRoomAvailability,
  updateStatus: validation.validateId,
};

const bookingValidation = {
  checkAvailability: validation.validateCheckAvailability,
  createBooking: validation.validateCreateBooking,
  updateBooking: validation.validateUpdateBooking,
  addService: validation.validateId,
};

const paymentValidation = {
  createPayment: validation.validateCreatePayment,
  updateStatus: validation.validateUpdatePaymentStatus,
  processRefund: validation.validateId,
};

const serviceValidation = {
  createService: validation.validateCreateService,
  updateService: validation.validateUpdateService,
};

const reviewValidation = {
  createReview: validation.validateCreateReview,
  updateReview: validation.validateUpdateReview,
};

const reportValidation = {
  createStaffReport: validation.validateId,
  updateStaffReport: validation.validateId,
};

module.exports = {
  authenticate,
  authorize,
  userValidation,
  roomValidation,
  bookingValidation,
  paymentValidation,
  serviceValidation,
  reviewValidation,
  reportValidation,
  uploadUserAvatar,
  uploadRoomImages,
  errorHandler,
  notFound,
};
