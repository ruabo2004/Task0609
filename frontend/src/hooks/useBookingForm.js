import { useState, useCallback, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  differenceInDays,
  parseISO,
  format,
  isAfter,
  isBefore,
} from "date-fns";
import bookingService from "@services/bookingService";
import { useBookings } from "./useBookings";

/**
 * Hook for managing booking form state and validation
 * @param {Object} options - Hook options
 * @returns {Object} Booking form management functions and state
 */
export const useBookingForm = (options = {}) => {
  const {
    roomId,
    initialData = {},
    onSuccess,
    onError,
    enableAutoSave = false,
    validationMode = "onBlur",
  } = options;

  const { createBooking } = useBookings({ enableNotifications: false });

  // ==========================================
  // FORM STATE MANAGEMENT
  // ==========================================

  const form = useForm({
    mode: validationMode,
    defaultValues: {
      room_id: roomId || "",
      check_in_date: "",
      check_out_date: "",
      check_in_time: "14:00",
      check_out_time: "12:00",
      adults: 1,
      children: 0,
      infants: 0,
      special_requests: "",
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      guests: [],
      extra_services: [],
      discount_code: "",
      payment_method: "credit_card",
      terms_accepted: false,
      marketing_consent: false,
      ...initialData,
    },
  });

  const {
    watch,
    setValue,
    getValues,
    trigger,
    formState: { errors, isValid },
  } = form;

  // ==========================================
  // ADDITIONAL STATE
  // ==========================================

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priceCalculation, setPriceCalculation] = useState(null);
  const [availabilityStatus, setAvailabilityStatus] = useState(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [appliedDiscountCode, setAppliedDiscountCode] = useState(null);
  const [extraServices, setExtraServices] = useState([]);

  // Watch form values
  const watchedValues = watch();
  const {
    check_in_date,
    check_out_date,
    adults,
    children,
    infants,
    extra_services,
    discount_code,
  } = watchedValues;

  // ==========================================
  // COMPUTED VALUES
  // ==========================================

  const totalGuests = useMemo(() => {
    return (adults || 0) + (children || 0) + (infants || 0);
  }, [adults, children, infants]);

  const numberOfNights = useMemo(() => {
    if (!check_in_date || !check_out_date) return 0;

    try {
      const checkIn = parseISO(check_in_date);
      const checkOut = parseISO(check_out_date);
      return Math.max(0, differenceInDays(checkOut, checkIn));
    } catch (error) {
      return 0;
    }
  }, [check_in_date, check_out_date]);

  const isDateRangeValid = useMemo(() => {
    if (!check_in_date || !check_out_date) return false;

    try {
      const checkIn = parseISO(check_in_date);
      const checkOut = parseISO(check_out_date);
      const today = new Date();

      return (
        isAfter(checkIn, today) &&
        isAfter(checkOut, checkIn) &&
        numberOfNights >= 1
      );
    } catch (error) {
      return false;
    }
  }, [check_in_date, check_out_date, numberOfNights]);

  const bookingSteps = useMemo(
    () => [
      {
        step: 1,
        title: "Thông tin đặt phòng",
        description: "Chọn ngày và số khách",
        isValid: isDateRangeValid && totalGuests > 0,
      },
      {
        step: 2,
        title: "Thông tin khách hàng",
        description: "Điền thông tin liên hệ",
        isValid:
          watchedValues.contact_name &&
          watchedValues.contact_email &&
          watchedValues.contact_phone,
      },
      {
        step: 3,
        title: "Dịch vụ thêm",
        description: "Chọn dịch vụ bổ sung (tùy chọn)",
        isValid: true, // This step is always valid as it's optional
      },
      {
        step: 4,
        title: "Thanh toán",
        description: "Xác nhận và thanh toán",
        isValid: watchedValues.terms_accepted && watchedValues.payment_method,
      },
    ],
    [isDateRangeValid, totalGuests, watchedValues]
  );

  const currentStepData = useMemo(() => {
    return (
      bookingSteps.find((step) => step.step === currentStep) || bookingSteps[0]
    );
  }, [bookingSteps, currentStep]);

  const canProceedToNextStep = useMemo(() => {
    return currentStepData.isValid;
  }, [currentStepData]);

  const canGoToPreviousStep = useMemo(() => {
    return currentStep > 1;
  }, [currentStep]);

  const isLastStep = useMemo(() => {
    return currentStep === bookingSteps.length;
  }, [currentStep, bookingSteps.length]);

  // ==========================================
  // AVAILABILITY & PRICING
  // ==========================================

  const checkAvailability = useCallback(async () => {
    if (!roomId || !isDateRangeValid) return;

    setIsCheckingAvailability(true);
    try {
      const result = await bookingService.checkAvailability({
        room_id: roomId,
        check_in_date,
        check_out_date,
        guests: totalGuests,
      });

      setAvailabilityStatus(result.data);
      return result.data;
    } catch (error) {
      setAvailabilityStatus({ available: false, message: error.message });
      toast.error(error.message || "Không thể kiểm tra tình trạng phòng");
      return { available: false, message: error.message };
    } finally {
      setIsCheckingAvailability(false);
    }
  }, [roomId, check_in_date, check_out_date, totalGuests, isDateRangeValid]);

  const calculatePrice = useCallback(async () => {
    if (!roomId || !isDateRangeValid) return;

    try {
      const result = await bookingService.calculatePrice({
        room_id: roomId,
        check_in_date,
        check_out_date,
        adults,
        children,
        infants,
        extra_services,
        discount_code: appliedDiscountCode?.code,
      });

      setPriceCalculation(result.data);
      return result.data;
    } catch (error) {
      console.error("Price calculation error:", error);
      toast.error("Không thể tính toán giá phòng");
      return null;
    }
  }, [
    roomId,
    check_in_date,
    check_out_date,
    adults,
    children,
    infants,
    extra_services,
    appliedDiscountCode,
    isDateRangeValid,
  ]);

  // ==========================================
  // FORM ACTIONS
  // ==========================================

  const goToNextStep = useCallback(() => {
    if (canProceedToNextStep && !isLastStep) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [canProceedToNextStep, isLastStep]);

  const goToPreviousStep = useCallback(() => {
    if (canGoToPreviousStep) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [canGoToPreviousStep]);

  const goToStep = useCallback(
    (step) => {
      if (step >= 1 && step <= bookingSteps.length) {
        setCurrentStep(step);
      }
    },
    [bookingSteps.length]
  );

  const addGuest = useCallback(() => {
    const currentGuests = getValues("guests") || [];
    const newGuest = {
      id: Date.now(),
      full_name: "",
      email: "",
      phone: "",
      date_of_birth: "",
      nationality: "",
      id_number: "",
      special_requirements: "",
    };

    setValue("guests", [...currentGuests, newGuest]);
  }, [getValues, setValue]);

  const removeGuest = useCallback(
    (guestId) => {
      const currentGuests = getValues("guests") || [];
      const updatedGuests = currentGuests.filter(
        (guest) => guest.id !== guestId
      );
      setValue("guests", updatedGuests);
    },
    [getValues, setValue]
  );

  const updateGuest = useCallback(
    (guestId, guestData) => {
      const currentGuests = getValues("guests") || [];
      const updatedGuests = currentGuests.map((guest) =>
        guest.id === guestId ? { ...guest, ...guestData } : guest
      );
      setValue("guests", updatedGuests);
    },
    [getValues, setValue]
  );

  const addExtraService = useCallback(
    (service) => {
      const currentServices = getValues("extra_services") || [];
      const existingService = currentServices.find(
        (s) => s.service_id === service.service_id
      );

      if (existingService) {
        // Update quantity
        const updatedServices = currentServices.map((s) =>
          s.service_id === service.service_id
            ? { ...s, quantity: s.quantity + 1 }
            : s
        );
        setValue("extra_services", updatedServices);
      } else {
        // Add new service
        setValue("extra_services", [
          ...currentServices,
          { ...service, quantity: 1 },
        ]);
      }
    },
    [getValues, setValue]
  );

  const removeExtraService = useCallback(
    (serviceId) => {
      const currentServices = getValues("extra_services") || [];
      const updatedServices = currentServices.filter(
        (s) => s.service_id !== serviceId
      );
      setValue("extra_services", updatedServices);
    },
    [getValues, setValue]
  );

  const updateExtraServiceQuantity = useCallback(
    (serviceId, quantity) => {
      if (quantity <= 0) {
        removeExtraService(serviceId);
        return;
      }

      const currentServices = getValues("extra_services") || [];
      const updatedServices = currentServices.map((s) =>
        s.service_id === serviceId ? { ...s, quantity } : s
      );
      setValue("extra_services", updatedServices);
    },
    [getValues, setValue, removeExtraService]
  );

  const applyDiscountCode = useCallback(
    async (code) => {
      if (!code.trim()) return;

      try {
        const result = await bookingService.validateDiscountCode(code, {
          room_id: roomId,
          check_in_date,
          check_out_date,
          total_amount: priceCalculation?.total_amount,
        });

        if (result.data.valid) {
          setAppliedDiscountCode(result.data);
          setValue("discount_code", code);
          toast.success(
            `Áp dụng mã giảm giá thành công! Giảm ${result.data.discount_amount}đ`
          );

          // Recalculate price with discount
          await calculatePrice();
        } else {
          toast.error(result.data.message || "Mã giảm giá không hợp lệ");
        }
      } catch (error) {
        toast.error(error.message || "Không thể áp dụng mã giảm giá");
      }
    },
    [
      roomId,
      check_in_date,
      check_out_date,
      priceCalculation,
      setValue,
      calculatePrice,
    ]
  );

  const removeDiscountCode = useCallback(() => {
    setAppliedDiscountCode(null);
    setValue("discount_code", "");
    calculatePrice();
    toast.info("Đã bỏ mã giảm giá");
  }, [setValue, calculatePrice]);

  // ==========================================
  // FORM SUBMISSION
  // ==========================================

  const submitBooking = useCallback(
    async (formData) => {
      if (!isValid) {
        toast.error("Vui lòng kiểm tra lại thông tin đã nhập");
        return;
      }

      setIsSubmitting(true);
      try {
        const bookingData = {
          ...formData,
          room_id: roomId,
          total_nights: numberOfNights,
          total_guests: totalGuests,
          price_calculation: priceCalculation,
          applied_discount: appliedDiscountCode,
        };

        const result = await createBooking(bookingData);

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (error) {
        if (onError) {
          onError(error);
        } else {
          toast.error(error.message || "Không thể tạo booking");
        }
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      isValid,
      roomId,
      numberOfNights,
      totalGuests,
      priceCalculation,
      appliedDiscountCode,
      createBooking,
      onSuccess,
      onError,
    ]
  );

  // ==========================================
  // EFFECTS
  // ==========================================

  // Auto-check availability when dates or guests change
  useEffect(() => {
    if (isDateRangeValid && totalGuests > 0) {
      const timeoutId = setTimeout(() => {
        checkAvailability();
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [
    check_in_date,
    check_out_date,
    totalGuests,
    checkAvailability,
    isDateRangeValid,
  ]);

  // Auto-calculate price when relevant fields change
  useEffect(() => {
    if (isDateRangeValid && availabilityStatus?.available) {
      const timeoutId = setTimeout(() => {
        calculatePrice();
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [
    check_in_date,
    check_out_date,
    adults,
    children,
    infants,
    extra_services,
    appliedDiscountCode,
    calculatePrice,
    isDateRangeValid,
    availabilityStatus,
  ]);

  // Load extra services
  useEffect(() => {
    const loadExtraServices = async () => {
      try {
        const result = await bookingService.getExtraServices(roomId);
        setExtraServices(result.data || []);
      } catch (error) {
        console.error("Error loading extra services:", error);
      }
    };

    if (roomId) {
      loadExtraServices();
    }
  }, [roomId]);

  // Auto-save functionality
  useEffect(() => {
    if (enableAutoSave) {
      const timeoutId = setTimeout(() => {
        const formData = getValues();
        localStorage.setItem(
          `booking_form_${roomId}`,
          JSON.stringify(formData)
        );
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [watchedValues, enableAutoSave, roomId, getValues]);

  // ==========================================
  // RETURN VALUES
  // ==========================================

  return {
    // Form management
    form,
    errors,
    isValid,
    watchedValues,

    // Step management
    currentStep,
    bookingSteps,
    currentStepData,
    canProceedToNextStep,
    canGoToPreviousStep,
    isLastStep,
    goToNextStep,
    goToPreviousStep,
    goToStep,

    // Computed values
    totalGuests,
    numberOfNights,
    isDateRangeValid,

    // Availability & Pricing
    availabilityStatus,
    isCheckingAvailability,
    checkAvailability,
    priceCalculation,
    calculatePrice,

    // Guest management
    addGuest,
    removeGuest,
    updateGuest,

    // Extra services
    extraServices,
    addExtraService,
    removeExtraService,
    updateExtraServiceQuantity,

    // Discount codes
    appliedDiscountCode,
    applyDiscountCode,
    removeDiscountCode,

    // Form submission
    isSubmitting,
    submitBooking,

    // Utility functions
    resetForm: form.reset,
    validateForm: trigger,
    setFormValue: setValue,
    getFormValue: getValues,
  };
};

export default useBookingForm;


