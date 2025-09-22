import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { toast } from "react-toastify";
import paymentService from "@services/paymentService";

/**
 * Hook for managing payment processing
 * @param {Object} options - Hook options
 * @returns {Object} Payment management functions and state
 */
export const usePayment = (options = {}) => {
  const queryClient = useQueryClient();
  const {
    enableNotifications = true,
    autoLoadMethods = true,
    cacheTime = 10 * 60 * 1000, // 10 minutes
    staleTime = 5 * 60 * 1000, // 5 minutes
  } = options;

  // ==========================================
  // STATE MANAGEMENT
  // ==========================================

  const [paymentIntent, setPaymentIntent] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("idle"); // idle, processing, success, failed
  const [paymentError, setPaymentError] = useState(null);

  // ==========================================
  // QUERIES
  // ==========================================

  // Get available payment methods
  const {
    data: paymentMethodsData,
    isLoading: isLoadingMethods,
    error: methodsError,
    refetch: refetchMethods,
  } = useQuery(["payment-methods"], () => paymentService.getPaymentMethods(), {
    enabled: autoLoadMethods,
    staleTime,
    cacheTime,
    onError: (error) => {
      if (enableNotifications) {
        toast.error("Không thể tải phương thức thanh toán");
      }
    },
  });

  // Get user's saved payment methods
  const {
    data: userPaymentMethodsData,
    isLoading: isLoadingUserMethods,
    error: userMethodsError,
    refetch: refetchUserMethods,
  } = useQuery(
    ["user-payment-methods"],
    () => paymentService.getUserPaymentMethods(),
    {
      enabled: autoLoadMethods,
      staleTime,
      cacheTime,
      onError: (error) => {
        console.error("Error loading user payment methods:", error);
      },
    }
  );

  // Get payment history
  const {
    data: paymentHistoryData,
    isLoading: isLoadingHistory,
    error: historyError,
    refetch: refetchHistory,
  } = useQuery(["payment-history"], () => paymentService.getPaymentHistory(), {
    enabled: false, // Load on demand
    staleTime,
    cacheTime,
  });

  // ==========================================
  // MUTATIONS
  // ==========================================

  // Create payment intent
  const createPaymentIntentMutation = useMutation(
    (intentData) => paymentService.createPaymentIntent(intentData),
    {
      onSuccess: (data) => {
        setPaymentIntent(data.data);
        setPaymentStatus("ready");

        if (enableNotifications) {
          toast.success("Sẵn sàng thanh toán");
        }
      },
      onError: (error) => {
        setPaymentError(error.message);
        setPaymentStatus("failed");

        if (enableNotifications) {
          toast.error(error.message || "Không thể tạo yêu cầu thanh toán");
        }
      },
    }
  );

  // Process payment
  const processPaymentMutation = useMutation(
    (paymentData) => paymentService.processPayment(paymentData),
    {
      onMutate: () => {
        setPaymentStatus("processing");
        setPaymentError(null);
      },
      onSuccess: (data) => {
        setPaymentStatus("success");
        queryClient.invalidateQueries(["payment-history"]);

        if (enableNotifications) {
          toast.success("Thanh toán thành công!");
        }

        return data;
      },
      onError: (error) => {
        setPaymentStatus("failed");
        setPaymentError(error.message);

        if (enableNotifications) {
          toast.error(error.message || "Thanh toán thất bại");
        }
      },
    }
  );

  // Confirm payment
  const confirmPaymentMutation = useMutation(
    ({ paymentIntentId, confirmData }) =>
      paymentService.confirmPayment(paymentIntentId, confirmData),
    {
      onMutate: () => {
        setPaymentStatus("processing");
      },
      onSuccess: (data) => {
        setPaymentStatus("success");
        queryClient.invalidateQueries(["payment-history"]);

        if (enableNotifications) {
          toast.success("Xác nhận thanh toán thành công!");
        }

        return data;
      },
      onError: (error) => {
        setPaymentStatus("failed");
        setPaymentError(error.message);

        if (enableNotifications) {
          toast.error(error.message || "Không thể xác nhận thanh toán");
        }
      },
    }
  );

  // Save payment method
  const savePaymentMethodMutation = useMutation(
    (methodData) => paymentService.savePaymentMethod(methodData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["user-payment-methods"]);

        if (enableNotifications) {
          toast.success("Lưu phương thức thanh toán thành công!");
        }
      },
      onError: (error) => {
        if (enableNotifications) {
          toast.error(error.message || "Không thể lưu phương thức thanh toán");
        }
      },
    }
  );

  // Delete payment method
  const deletePaymentMethodMutation = useMutation(
    (methodId) => paymentService.deletePaymentMethod(methodId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["user-payment-methods"]);

        if (enableNotifications) {
          toast.success("Xóa phương thức thanh toán thành công!");
        }
      },
      onError: (error) => {
        if (enableNotifications) {
          toast.error(error.message || "Không thể xóa phương thức thanh toán");
        }
      },
    }
  );

  // Apply discount code
  const applyDiscountMutation = useMutation(
    (discountData) => paymentService.applyDiscountCode(discountData),
    {
      onSuccess: (data) => {
        if (enableNotifications) {
          toast.success(
            `Áp dụng mã giảm giá thành công! Giảm ${data.data.discount_amount}đ`
          );
        }
        return data;
      },
      onError: (error) => {
        if (enableNotifications) {
          toast.error(error.message || "Mã giảm giá không hợp lệ");
        }
      },
    }
  );

  // Process refund
  const processRefundMutation = useMutation(
    (refundData) => paymentService.processRefund(refundData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["payment-history"]);

        if (enableNotifications) {
          toast.success("Yêu cầu hoàn tiền đã được gửi!");
        }
      },
      onError: (error) => {
        if (enableNotifications) {
          toast.error(error.message || "Không thể xử lý hoàn tiền");
        }
      },
    }
  );

  // ==========================================
  // COMPUTED VALUES
  // ==========================================

  const paymentMethods = useMemo(() => {
    return paymentMethodsData?.data || [];
  }, [paymentMethodsData]);

  const userPaymentMethods = useMemo(() => {
    return userPaymentMethodsData?.data || [];
  }, [userPaymentMethodsData]);

  const paymentHistory = useMemo(() => {
    return paymentHistoryData?.data?.payments || [];
  }, [paymentHistoryData]);

  const isProcessing = useMemo(() => {
    return (
      paymentStatus === "processing" ||
      createPaymentIntentMutation.isLoading ||
      processPaymentMutation.isLoading ||
      confirmPaymentMutation.isLoading
    );
  }, [
    paymentStatus,
    createPaymentIntentMutation.isLoading,
    processPaymentMutation.isLoading,
    confirmPaymentMutation.isLoading,
  ]);

  const canPay = useMemo(() => {
    return (
      paymentIntent && selectedPaymentMethod && paymentStatus !== "processing"
    );
  }, [paymentIntent, selectedPaymentMethod, paymentStatus]);

  // ==========================================
  // ACTION FUNCTIONS
  // ==========================================

  // Create payment intent
  const createPaymentIntent = useCallback(
    async (intentData) => {
      try {
        const result = await createPaymentIntentMutation.mutateAsync(
          intentData
        );
        return result;
      } catch (error) {
        throw error;
      }
    },
    [createPaymentIntentMutation]
  );

  // Process payment
  const processPayment = useCallback(
    async (paymentData) => {
      try {
        const result = await processPaymentMutation.mutateAsync(paymentData);
        return result;
      } catch (error) {
        throw error;
      }
    },
    [processPaymentMutation]
  );

  // Confirm payment
  const confirmPayment = useCallback(
    async (paymentIntentId, confirmData = {}) => {
      try {
        const result = await confirmPaymentMutation.mutateAsync({
          paymentIntentId,
          confirmData,
        });
        return result;
      } catch (error) {
        throw error;
      }
    },
    [confirmPaymentMutation]
  );

  // Save payment method
  const savePaymentMethod = useCallback(
    async (methodData) => {
      try {
        const result = await savePaymentMethodMutation.mutateAsync(methodData);
        return result;
      } catch (error) {
        throw error;
      }
    },
    [savePaymentMethodMutation]
  );

  // Delete payment method
  const deletePaymentMethod = useCallback(
    async (methodId) => {
      try {
        const result = await deletePaymentMethodMutation.mutateAsync(methodId);
        return result;
      } catch (error) {
        throw error;
      }
    },
    [deletePaymentMethodMutation]
  );

  // Select payment method
  const selectPaymentMethod = useCallback((method) => {
    setSelectedPaymentMethod(method);
  }, []);

  // Apply discount code
  const applyDiscountCode = useCallback(
    async (discountData) => {
      try {
        const result = await applyDiscountMutation.mutateAsync(discountData);
        return result;
      } catch (error) {
        throw error;
      }
    },
    [applyDiscountMutation]
  );

  // Process refund
  const processRefund = useCallback(
    async (refundData) => {
      try {
        const result = await processRefundMutation.mutateAsync(refundData);
        return result;
      } catch (error) {
        throw error;
      }
    },
    [processRefundMutation]
  );

  // Reset payment state
  const resetPaymentState = useCallback(() => {
    setPaymentIntent(null);
    setSelectedPaymentMethod(null);
    setPaymentStatus("idle");
    setPaymentError(null);
  }, []);

  // Load payment history
  const loadPaymentHistory = useCallback(() => {
    return refetchHistory();
  }, [refetchHistory]);

  // Validate payment data
  const validatePaymentData = useCallback(
    (paymentData) => {
      const errors = {};

      if (!paymentData.amount || paymentData.amount <= 0) {
        errors.amount = "Số tiền thanh toán không hợp lệ";
      }

      if (!paymentData.currency) {
        errors.currency = "Loại tiền tệ là bắt buộc";
      }

      if (!selectedPaymentMethod) {
        errors.payment_method = "Vui lòng chọn phương thức thanh toán";
      }

      // Credit card validation
      if (selectedPaymentMethod?.type === "credit_card") {
        if (!paymentData.card_number || paymentData.card_number.length < 16) {
          errors.card_number = "Số thẻ không hợp lệ";
        }

        if (!paymentData.expiry_month || !paymentData.expiry_year) {
          errors.expiry = "Ngày hết hạn không hợp lệ";
        }

        if (!paymentData.cvv || paymentData.cvv.length < 3) {
          errors.cvv = "Mã CVV không hợp lệ";
        }

        if (!paymentData.cardholder_name) {
          errors.cardholder_name = "Tên chủ thẻ là bắt buộc";
        }
      }

      return {
        isValid: Object.keys(errors).length === 0,
        errors,
      };
    },
    [selectedPaymentMethod]
  );

  // Format payment amount
  const formatPaymentAmount = useCallback((amount, currency = "VND") => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: currency,
    }).format(amount);
  }, []);

  // ==========================================
  // RETURN VALUES
  // ==========================================

  return {
    // Data
    paymentMethods,
    userPaymentMethods,
    paymentHistory,
    paymentIntent,
    selectedPaymentMethod,

    // Status
    paymentStatus,
    paymentError,
    isProcessing,
    canPay,

    // Loading states
    isLoadingMethods,
    isLoadingUserMethods,
    isLoadingHistory,
    isCreatingIntent: createPaymentIntentMutation.isLoading,
    isProcessingPayment: processPaymentMutation.isLoading,
    isConfirmingPayment: confirmPaymentMutation.isLoading,
    isSavingMethod: savePaymentMethodMutation.isLoading,
    isDeletingMethod: deletePaymentMethodMutation.isLoading,
    isApplyingDiscount: applyDiscountMutation.isLoading,
    isProcessingRefund: processRefundMutation.isLoading,

    // Error states
    methodsError,
    userMethodsError,
    historyError,
    createIntentError: createPaymentIntentMutation.error,
    processPaymentError: processPaymentMutation.error,
    confirmPaymentError: confirmPaymentMutation.error,
    saveMethodError: savePaymentMethodMutation.error,
    deleteMethodError: deletePaymentMethodMutation.error,
    discountError: applyDiscountMutation.error,
    refundError: processRefundMutation.error,

    // Actions
    createPaymentIntent,
    processPayment,
    confirmPayment,
    savePaymentMethod,
    deletePaymentMethod,
    selectPaymentMethod,
    applyDiscountCode,
    processRefund,
    resetPaymentState,
    loadPaymentHistory,

    // Utility functions
    validatePaymentData,
    formatPaymentAmount,
    refetchMethods,
    refetchUserMethods,
    refetchHistory,

    // Success data from mutations
    lastPaymentResult: processPaymentMutation.data,
    lastConfirmResult: confirmPaymentMutation.data,
    lastDiscountResult: applyDiscountMutation.data,
    lastRefundResult: processRefundMutation.data,
  };
};

export default usePayment;


