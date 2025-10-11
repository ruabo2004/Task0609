// Hooks Index
// Export all custom hooks for easy importing

// Core API hooks
export { useApi, useMutation, usePagination } from './useApi';

// Authentication hooks
export { 
  useAuth,
  useLogin,
  useRegister,
  useForgotPassword,
  useResetPassword,
  useChangePassword,
  useUpdateProfile,
  useUploadAvatar,
} from './useAuth';

// Booking management hooks
export {
  useBookings,
  useBooking,
  useCreateBooking,
  useUpdateBooking,
  useCancelBooking,
  useConfirmBooking,
  useCheckInBooking,
  useCheckOutBooking,
  useAddBookingService,
  useBookingServices,
  useBookingStats,
  useBookingSearch,
} from './useBookings';

// Room management hooks
export {
  useRooms,
  useAvailableRooms,
  useRoom,
  useCreateRoom,
  useUpdateRoom,
  useDeleteRoom,
  useUpdateRoomStatus,
  useUploadRoomImages,
  useRoomStats,
  useRoomTypes,
  useRoomSearch,
  useCheckRoomAvailability,
  useRoomBookedDates,
} from './useRooms';
