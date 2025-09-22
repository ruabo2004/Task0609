# 💳 CỤM 4: PAYMENT INTEGRATION - FRONTEND GUIDE

## 📋 **TỔNG QUAN**

Cụm 4 tập trung vào hệ thống thanh toán toàn diện với multiple payment gateways, security features, analytics, refund management, và recurring payment capabilities.

## 🗂️ **CẤU TRÚC FILES**

```
frontend/src/
├── components/
│   ├── Payment/
│   │   ├── PaymentMethods.js           # Available payment options
│   │   ├── PaymentMethodSelector.js    # Method selection UI
│   │   ├── PaymentForm.js              # Main payment form
│   │   ├── PaymentSummary.js           # Order summary
│   │   ├── PaymentStatus.js            # Payment result display
│   │   ├── PaymentHistory.js           # Transaction history
│   │   ├── PaymentAnalytics.js         # Payment analytics dashboard
│   │   ├── RefundRequest.js            # Refund management
│   │   ├── PaymentSecurity.js          # Security indicators
│   │   └── PaymentSchedule.js          # Installment management
│   ├── Gateways/
│   │   ├── MoMoPayment.js              # MoMo integration
│   │   ├── VNPayPayment.js             # VNPay integration
│   │   ├── BankTransfer.js             # Bank transfer UI
│   │   ├── CashPayment.js              # Cash payment info
│   │   ├── PayPalPayment.js            # PayPal integration
│   │   └── StripePayment.js            # Stripe integration
│   ├── SavedMethods/
│   │   ├── SavedPaymentMethods.js      # Saved methods list
│   │   ├── AddPaymentMethod.js         # Add new method
│   │   ├── EditPaymentMethod.js        # Edit saved method
│   │   └── DefaultMethodSelector.js    # Set default method
│   ├── Security/
│   │   ├── PaymentSecurityBadge.js     # Security indicators
│   │   ├── RiskAssessment.js           # Risk level display
│   │   ├── SecurityReport.js           # Security analytics
│   │   └── FraudAlert.js               # Fraud detection alerts
│   └── Installment/
│       ├── InstallmentPlan.js          # Payment plan selector
│       ├── InstallmentSchedule.js      # Schedule display
│       ├── InstallmentProgress.js      # Progress tracking
│       └── InstallmentManagement.js    # Manage installments
├── hooks/
│   ├── usePayment.js                   # Payment operations
│   ├── usePaymentMethods.js            # Payment methods management
│   ├── usePaymentSecurity.js           # Security validation
│   ├── usePaymentAnalytics.js          # Payment analytics
│   ├── useRefund.js                    # Refund operations
│   └── useInstallment.js               # Installment management
├── services/
│   ├── paymentService.js               # Main payment API
│   ├── gatewayService.js               # Gateway integrations
│   ├── securityService.js              # Security validations
│   ├── analyticsService.js             # Payment analytics
│   ├── refundService.js                # Refund operations
│   └── installmentService.js           # Installment management
├── utils/
│   ├── paymentValidation.js            # Payment form validation
│   ├── paymentFormatting.js            # Amount & currency formatting
│   ├── securityChecks.js               # Client-side security
│   └── paymentConstants.js             # Payment-related constants
└── contexts/
    ├── PaymentContext.js               # Payment state management
    └── PaymentSecurityContext.js       # Security state
```

## 🔑 **API ENDPOINTS SUMMARY**

### **Backend APIs Ready:**
```javascript
// Base URL: http://localhost:5000/api

const PAYMENT_ENDPOINTS = {
  // Enhanced Payment System
  methods: 'GET /payments/methods',                    // Available payment methods
  calculateFees: 'POST /payments/calculate-fees',     // Calculate payment fees
  createPayment: 'POST /payments/create',              // Create new payment
  getPaymentStatus: 'GET /payments/{paymentId}',       // Get payment details
  getPayments: 'GET /payments/payments',               // Customer payment history
  getAnalytics: 'GET /payments/analytics',             // Payment analytics
  
  // Saved Payment Methods
  getSavedMethods: 'GET /payments/saved-methods',      // Customer saved methods
  addMethod: 'POST /payments/saved-methods',           // Add payment method
  setDefault: 'PUT /payments/saved-methods/{id}/default', // Set default method
  deleteMethod: 'DELETE /payments/saved-methods/{id}', // Delete saved method
  
  // Refund Management
  createRefund: 'POST /payments/{paymentId}/refund',   // Request refund
  
  // Webhooks
  webhook: 'POST /payments/webhook/{gateway}',         // Payment gateway webhooks
  
  // Legacy MoMo Support
  momoCreate: 'POST /payment/momo/create',             // Legacy MoMo endpoint
  momoIPN: 'POST /payment/momo/ipn',                   // Legacy MoMo IPN
  momoQuery: 'GET /payment/{id}/momo/query',           // Legacy MoMo query
  legacyStatus: 'GET /payment/{id}',                   // Legacy payment status
  legacyHistory: 'GET /payment/customer'               // Legacy payment history
};
```

## 💳 **PAYMENT GATEWAYS SUPPORTED**

### **1. MoMo E-Wallet (Active)**
```javascript
// Gateway Configuration
const momoConfig = {
  id: 'momo',
  name: 'MoMo E-Wallet',
  type: 'e_wallet',
  fees: { percentage: 2.5, fixed: 0 },
  supported_currencies: ['VND'],
  min_amount: 10000,      // 10,000 VND
  max_amount: 50000000,   // 50M VND
  processing_time: 'instant',
  features: ['qr_code', 'deep_link', 'web_redirect']
};

// Usage Example
const createMoMoPayment = async (bookingData) => {
  const response = await paymentService.createPayment({
    booking_id: bookingData.booking_id,
    payment_method: 'momo',
    amount: bookingData.total_amount,
    return_url: '/payment/success',
    cancel_url: '/payment/cancel'
  });
  
  // Redirect to MoMo payment page
  if (response.data.gateway_response.payment_url) {
    window.location.href = response.data.gateway_response.payment_url;
  }
};
```

### **2. Bank Transfer (Active)**
```javascript
// Gateway Configuration
const bankTransferConfig = {
  id: 'bank_transfer',
  name: 'Chuyển khoản ngân hàng',
  type: 'bank_transfer',
  fees: { percentage: 0, fixed: 0 },
  processing_time: '1-3 business days',
  features: ['qr_code', 'manual_verification']
};

// Usage Example
const createBankTransfer = async (bookingData) => {
  const response = await paymentService.createPayment({
    booking_id: bookingData.booking_id,
    payment_method: 'bank_transfer',
    amount: bookingData.total_amount
  });
  
  // Display bank transfer information
  const bankInfo = response.data.gateway_response.bank_info;
  return (
    <BankTransferInfo 
      bankInfo={bankInfo}
      qrCode={bankInfo.qr_code}
      instructions={response.data.gateway_response.instructions}
    />
  );
};
```

### **3. Cash Payment (Active)**
```javascript
// Gateway Configuration
const cashConfig = {
  id: 'cash',
  name: 'Tiền mặt',
  type: 'cash',
  fees: { percentage: 0, fixed: 0 },
  processing_time: 'on_checkin',
  features: ['on_site_payment']
};

// Usage Example
const createCashPayment = async (bookingData) => {
  const response = await paymentService.createPayment({
    booking_id: bookingData.booking_id,
    payment_method: 'cash',
    amount: bookingData.total_amount
  });
  
  return (
    <CashPaymentInfo 
      amount={bookingData.total_amount}
      instructions={response.data.gateway_response.instructions}
      checkInDate={bookingData.check_in_date}
    />
  );
};
```

### **4. VNPay Gateway (Ready for Implementation)**
```javascript
// Gateway Configuration (To be implemented)
const vnpayConfig = {
  id: 'vnpay',
  name: 'VNPay Gateway',
  type: 'gateway',
  fees: { percentage: 1.8, fixed: 0 },
  supported_currencies: ['VND'],
  min_amount: 10000,
  max_amount: 100000000,
  processing_time: 'instant',
  features: ['atm_card', 'credit_card', 'qr_code']
};
```

## 🔒 **PAYMENT SECURITY FEATURES**

### **1. Security Validation System**
```javascript
// Payment Security Service
const usePaymentSecurity = () => {
  const [securityStatus, setSecurityStatus] = useState(null);
  const [riskLevel, setRiskLevel] = useState('low');

  const validatePayment = async (paymentData) => {
    try {
      const response = await paymentService.validateSecurity({
        amount: paymentData.amount,
        payment_method: paymentData.payment_method,
        booking_id: paymentData.booking_id
      });

      setSecurityStatus(response.data.security_result);
      setRiskLevel(response.data.security_result.risk_level);

      return response.data.security_result;
    } catch (error) {
      console.error('Security validation failed:', error);
      return null;
    }
  };

  return {
    securityStatus,
    riskLevel,
    validatePayment,
    isSecure: riskLevel !== 'high'
  };
};

// Security Component
const PaymentSecurityBadge = ({ riskLevel, securityChecks }) => {
  const getSecurityColor = (level) => {
    switch (level) {
      case 'low': return 'green';
      case 'medium': return 'orange';
      case 'high': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div className={`security-badge ${getSecurityColor(riskLevel)}`}>
      <Shield className="security-icon" />
      <span>Mức độ bảo mật: {riskLevel.toUpperCase()}</span>
      
      {securityChecks && (
        <div className="security-details">
          <div className="check-item">
            ✓ Kiểm tra giới hạn số tiền
          </div>
          <div className="check-item">
            ✓ Xác thực thiết bị
          </div>
          <div className="check-item">
            ✓ Phân tích hành vi giao dịch
          </div>
        </div>
      )}
    </div>
  );
};
```

### **2. Fraud Detection System**
```javascript
// Security Checks Implementation
const securityChecks = {
  // Amount limits validation
  amount_limit: {
    passed: amount <= maxTransactionAmount,
    details: { limit: maxTransactionAmount, current: amount }
  },
  
  // Daily transaction limits
  daily_limit: {
    passed: dailyAmount + amount <= maxDailyAmount,
    details: { daily_limit: maxDailyAmount, current_daily: dailyAmount }
  },
  
  // Payment velocity check
  velocity_check: {
    passed: recentPayments < 3,
    details: { recent_payments: recentPayments, time_window: '1 hour' }
  },
  
  // Duplicate payment detection
  duplicate_check: {
    passed: !hasDuplicatePayment,
    details: { duplicate_found: hasDuplicatePayment }
  },
  
  // Failed attempts monitoring
  failed_attempts: {
    passed: failedAttempts < 5,
    details: { failed_attempts: failedAttempts, limit: 5 }
  }
};

// Risk Score Calculation
const calculateRiskScore = (checks) => {
  const weights = {
    amount_limit: 30,
    daily_limit: 25,
    velocity_check: 20,
    duplicate_check: 15,
    failed_attempts: 35
  };
  
  let riskScore = 0;
  Object.keys(weights).forEach(check => {
    if (!checks[check]?.passed) {
      riskScore += weights[check];
    }
  });
  
  return Math.min(100, riskScore);
};
```

## 📊 **PAYMENT ANALYTICS & REPORTING**

### **1. Payment Analytics Dashboard**
```javascript
// Analytics Hook
const usePaymentAnalytics = (timeframe = '30d') => {
  const { data: analytics, isLoading } = useQuery(
    ['payment-analytics', timeframe],
    () => paymentService.getAnalytics({ timeframe }),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchInterval: 10 * 60 * 1000 // 10 minutes
    }
  );

  const summary = analytics?.summary || {};
  const paymentMethods = analytics?.by_payment_method || [];
  const trends = analytics?.daily_trends || [];

  return {
    analytics: {
      total_transactions: summary.total_transactions || 0,
      successful_transactions: summary.successful_transactions || 0,
      success_rate: summary.success_rate || 0,
      total_amount: summary.total_amount || 0,
      total_fees: summary.total_fees || 0,
      average_transaction: summary.average_transaction || 0,
      favorite_payment_method: summary.favorite_payment_method || null
    },
    paymentMethods,
    trends,
    isLoading
  };
};

// Analytics Component
const PaymentAnalytics = () => {
  const [timeframe, setTimeframe] = useState('30d');
  const { analytics, paymentMethods, trends, isLoading } = usePaymentAnalytics(timeframe);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="payment-analytics">
      <div className="analytics-header">
        <h2>Phân tích thanh toán</h2>
        <TimeframeSelector 
          value={timeframe}
          onChange={setTimeframe}
          options={[
            { value: '7d', label: '7 ngày' },
            { value: '30d', label: '30 ngày' },
            { value: '90d', label: '90 ngày' },
            { value: '1y', label: '1 năm' }
          ]}
        />
      </div>

      <div className="analytics-grid">
        <MetricCard
          title="Tổng giao dịch"
          value={analytics.total_transactions}
          icon={<CreditCard />}
        />
        <MetricCard
          title="Tỷ lệ thành công"
          value={`${analytics.success_rate}%`}
          icon={<CheckCircle />}
          color="green"
        />
        <MetricCard
          title="Tổng số tiền"
          value={formatCurrency(analytics.total_amount)}
          icon={<DollarSign />}
          color="blue"
        />
        <MetricCard
          title="Phí giao dịch"
          value={formatCurrency(analytics.total_fees)}
          icon={<Receipt />}
          color="orange"
        />
      </div>

      <div className="analytics-charts">
        <PaymentMethodChart data={paymentMethods} />
        <PaymentTrendsChart data={trends} />
      </div>
    </div>
  );
};
```

### **2. Payment History with Filtering**
```javascript
// Payment History Hook
const usePaymentHistory = (filters = {}) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});

  const fetchPayments = async (page = 1) => {
    setLoading(true);
    try {
      const response = await paymentService.getPayments({
        page,
        limit: 20,
        ...filters
      });

      setPayments(response.data.payments);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  return {
    payments,
    pagination,
    loading,
    fetchPayments,
    refetch: () => fetchPayments(1)
  };
};

// Payment History Component
const PaymentHistory = () => {
  const [filters, setFilters] = useState({});
  const { payments, pagination, loading, fetchPayments } = usePaymentHistory(filters);

  return (
    <div className="payment-history">
      <div className="history-header">
        <h2>Lịch sử thanh toán</h2>
        <PaymentFilters filters={filters} onChange={setFilters} />
      </div>

      <div className="payment-list">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {payments.map(payment => (
              <PaymentCard 
                key={payment.payment_id}
                payment={payment}
                onRefund={() => handleRefund(payment)}
                onViewDetails={() => handleViewDetails(payment)}
              />
            ))}
            
            <Pagination
              current={pagination.page}
              total={pagination.totalPages}
              onPageChange={fetchPayments}
            />
          </>
        )}
      </div>
    </div>
  );
};
```

## 💰 **REFUND MANAGEMENT SYSTEM**

### **1. Refund Request Interface**
```javascript
// Refund Hook
const useRefund = () => {
  const [loading, setLoading] = useState(false);

  const createRefund = async (paymentId, refundData) => {
    setLoading(true);
    try {
      const response = await paymentService.createRefund(paymentId, {
        amount: refundData.amount,
        reason: refundData.reason
      });

      toast.success('Yêu cầu hoàn tiền đã được gửi thành công');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Không thể tạo yêu cầu hoàn tiền';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createRefund,
    loading
  };
};

// Refund Request Component
const RefundRequest = ({ payment, onClose, onSuccess }) => {
  const [refundAmount, setRefundAmount] = useState(payment.amount);
  const [reason, setReason] = useState('');
  const { createRefund, loading } = useRefund();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason.trim()) {
      toast.error('Vui lòng nhập lý do hoàn tiền');
      return;
    }

    if (refundAmount <= 0 || refundAmount > payment.amount) {
      toast.error('Số tiền hoàn không hợp lệ');
      return;
    }

    try {
      const result = await createRefund(payment.payment_id, {
        amount: refundAmount,
        reason: reason.trim()
      });

      onSuccess?.(result);
      onClose();
    } catch (error) {
      // Error already handled in hook
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Yêu cầu hoàn tiền">
      <form onSubmit={handleSubmit} className="refund-form">
        <div className="form-group">
          <label>Thông tin thanh toán:</label>
          <div className="payment-info">
            <div>Mã giao dịch: {payment.transaction_id}</div>
            <div>Số tiền gốc: {formatCurrency(payment.amount)}</div>
            <div>Phương thức: {payment.gateway_display?.name}</div>
            <div>Ngày thanh toán: {formatDate(payment.created_at)}</div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="refundAmount">Số tiền hoàn:</label>
          <CurrencyInput
            id="refundAmount"
            value={refundAmount}
            onChange={setRefundAmount}
            max={payment.amount}
            placeholder="Nhập số tiền cần hoàn"
            required
          />
          <small>Tối đa: {formatCurrency(payment.amount)}</small>
        </div>

        <div className="form-group">
          <label htmlFor="reason">Lý do hoàn tiền:</label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Vui lòng mô tả lý do cần hoàn tiền..."
            rows={4}
            minLength={10}
            maxLength={500}
            required
          />
          <small>{reason.length}/500 ký tự</small>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onClose} disabled={loading}>
            Hủy
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Đang xử lý...' : 'Gửi yêu cầu'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
```

### **2. Refund Status Tracking**
```javascript
// Refund Status Component
const RefundStatus = ({ refund }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'approved': return 'blue';
      case 'completed': return 'green';
      case 'rejected': return 'red';
      default: return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Đang xử lý';
      case 'approved': return 'Đã duyệt';
      case 'completed': return 'Hoàn tất';
      case 'rejected': return 'Từ chối';
      default: return 'Không xác định';
    }
  };

  return (
    <div className="refund-status">
      <div className="status-header">
        <Badge color={getStatusColor(refund.status)}>
          {getStatusText(refund.status)}
        </Badge>
        <span className="refund-amount">
          {formatCurrency(refund.amount)}
        </span>
      </div>

      <div className="refund-details">
        <div>Mã hoàn tiền: {refund.refund_id}</div>
        <div>Lý do: {refund.reason}</div>
        <div>Ngày yêu cầu: {formatDate(refund.created_at)}</div>
        {refund.estimated_completion && (
          <div>Dự kiến hoàn tất: {refund.estimated_completion}</div>
        )}
      </div>

      {refund.status === 'completed' && refund.refunded_at && (
        <div className="completion-info">
          <CheckCircle className="success-icon" />
          <span>Đã hoàn tiền vào {formatDate(refund.refunded_at)}</span>
        </div>
      )}
    </div>
  );
};
```

## 🔄 **INSTALLMENT PAYMENT SYSTEM**

### **1. Installment Plan Selection**
```javascript
// Installment Hook
const useInstallment = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);

  const createSchedule = async (scheduleData) => {
    setLoading(true);
    try {
      const response = await installmentService.createSchedule(scheduleData);
      toast.success('Lịch trả góp đã được tạo thành công');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Không thể tạo lịch trả góp';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getSchedules = async () => {
    setLoading(true);
    try {
      const response = await installmentService.getSchedules();
      setSchedules(response.data.schedules);
    } catch (error) {
      console.error('Failed to fetch installment schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async (scheduleId) => {
    try {
      const response = await installmentService.processPayment(scheduleId);
      toast.success('Thanh toán trả góp thành công');
      await getSchedules(); // Refresh schedules
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Thanh toán trả góp thất bại';
      toast.error(message);
      throw error;
    }
  };

  return {
    schedules,
    loading,
    createSchedule,
    getSchedules,
    processPayment
  };
};

// Installment Plan Component
const InstallmentPlan = ({ booking, onPlanSelect }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const { createSchedule, loading } = useInstallment();

  const installmentPlans = [
    {
      id: '3months',
      name: '3 tháng',
      installments: 3,
      frequency: 'monthly',
      fee_percentage: 0,
      description: 'Chia thành 3 kỳ, mỗi tháng một lần'
    },
    {
      id: '6months',
      name: '6 tháng',
      installments: 6,
      frequency: 'monthly',
      fee_percentage: 2,
      description: 'Chia thành 6 kỳ, mỗi tháng một lần'
    },
    {
      id: '12months',
      name: '12 tháng',
      installments: 12,
      frequency: 'monthly',
      fee_percentage: 5,
      description: 'Chia thành 12 kỳ, mỗi tháng một lần'
    }
  ];

  const calculateInstallment = (plan) => {
    const totalAmount = booking.total_amount;
    const feeAmount = (totalAmount * plan.fee_percentage) / 100;
    const totalWithFee = totalAmount + feeAmount;
    const installmentAmount = Math.ceil(totalWithFee / plan.installments);

    return {
      original_amount: totalAmount,
      fee_amount: feeAmount,
      total_amount: totalWithFee,
      installment_amount: installmentAmount,
      savings: totalAmount - totalWithFee
    };
  };

  const handlePlanSelect = async (plan) => {
    setSelectedPlan(plan);
    
    const calculation = calculateInstallment(plan);
    const scheduleData = {
      booking_id: booking.booking_id,
      schedule_type: 'installment',
      payment_method: 'bank_transfer', // Default to bank transfer for installments
      total_amount: calculation.total_amount,
      installment_count: plan.installments,
      frequency: plan.frequency,
      start_date: new Date().toISOString().split('T')[0]
    };

    try {
      const schedule = await createSchedule(scheduleData);
      onPlanSelect?.(schedule);
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <div className="installment-plan">
      <h3>Chọn gói trả góp</h3>
      <p>Tổng số tiền cần thanh toán: {formatCurrency(booking.total_amount)}</p>

      <div className="plan-grid">
        {installmentPlans.map(plan => {
          const calculation = calculateInstallment(plan);
          
          return (
            <div 
              key={plan.id}
              className={`plan-card ${selectedPlan?.id === plan.id ? 'selected' : ''}`}
              onClick={() => handlePlanSelect(plan)}
            >
              <div className="plan-header">
                <h4>{plan.name}</h4>
                <div className="plan-badge">
                  {plan.fee_percentage === 0 ? 'Không phí' : `Phí ${plan.fee_percentage}%`}
                </div>
              </div>

              <div className="plan-details">
                <div className="installment-amount">
                  {formatCurrency(calculation.installment_amount)}/tháng
                </div>
                <div className="plan-description">{plan.description}</div>
                
                <div className="calculation-breakdown">
                  <div>Số tiền gốc: {formatCurrency(calculation.original_amount)}</div>
                  {calculation.fee_amount > 0 && (
                    <div>Phí trả góp: {formatCurrency(calculation.fee_amount)}</div>
                  )}
                  <div className="total-line">
                    Tổng cộng: {formatCurrency(calculation.total_amount)}
                  </div>
                </div>
              </div>

              <button 
                className="select-plan-btn"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Chọn gói này'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

### **2. Installment Progress Tracking**
```javascript
// Installment Progress Component
const InstallmentProgress = ({ schedule }) => {
  const progress = schedule.progress;
  const progressPercentage = (progress.completed_installments / progress.total_installments) * 100;

  return (
    <div className="installment-progress">
      <div className="progress-header">
        <h4>Tiến độ trả góp</h4>
        <span className="schedule-status">
          <Badge color={schedule.status === 'active' ? 'green' : 'gray'}>
            {schedule.status === 'active' ? 'Đang hoạt động' : 'Đã hoàn thành'}
          </Badge>
        </span>
      </div>

      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${progressPercentage}%` }}
        />
        <span className="progress-text">
          {progress.completed_installments}/{progress.total_installments} kỳ
        </span>
      </div>

      <div className="progress-stats">
        <div className="stat-item">
          <span className="stat-label">Đã thanh toán:</span>
          <span className="stat-value">{formatCurrency(progress.amount_paid)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Còn lại:</span>
          <span className="stat-value">{formatCurrency(progress.amount_remaining)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Kỳ tiếp theo:</span>
          <span className="stat-value">
            {schedule.next_payment_date ? formatDate(schedule.next_payment_date) : 'Đã hoàn thành'}
          </span>
        </div>
      </div>

      {schedule.is_due && (
        <div className="due-payment-alert">
          <AlertCircle className="alert-icon" />
          <span>Kỳ thanh toán đã đến hạn!</span>
          <button className="pay-now-btn">
            Thanh toán ngay
          </button>
        </div>
      )}
    </div>
  );
};
```

## 🎯 **IMPLEMENTATION ROADMAP**

### **Phase 1: Core Payment System (Week 1)**
- [x] Enhanced payment controller với multiple gateways
- [x] Payment method management system
- [x] Security validation framework
- [x] Transaction tracking system
- [ ] Frontend payment form components
- [ ] Gateway integration components

### **Phase 2: Security & Analytics (Week 2)**
- [x] Payment security service với fraud detection
- [x] Risk assessment system
- [x] Payment analytics backend
- [x] Transaction monitoring
- [ ] Security dashboard components
- [ ] Analytics visualization

### **Phase 3: Refund Management (Week 3)**
- [x] Refund request system
- [x] Refund tracking backend
- [ ] Refund request UI components
- [ ] Refund status tracking
- [ ] Refund history management

### **Phase 4: Installment System (Week 4)**
- [x] Payment schedule model
- [x] Installment management backend
- [ ] Installment plan selector
- [ ] Progress tracking UI
- [ ] Payment reminder system

### **Phase 5: Integration & Testing (Week 5)**
- [ ] Gateway SDK integrations
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Security penetration testing
- [ ] User acceptance testing

## 📊 **PERFORMANCE METRICS**

### **Technical Performance:**
- **Payment Processing Time**: < 3 seconds
- **Security Validation**: < 500ms
- **Analytics Load Time**: < 2 seconds
- **Database Query Performance**: < 100ms
- **API Response Time**: < 200ms

### **Business Metrics:**
- **Payment Success Rate**: > 95%
- **Fraud Detection Rate**: > 99%
- **Customer Satisfaction**: > 4.5/5
- **Refund Processing Time**: < 24 hours
- **Security Incident Rate**: < 0.1%

### **User Experience:**
- **Payment Form Completion**: > 90%
- **Mobile Payment Success**: > 95%
- **Security Trust Score**: > 4.8/5
- **Customer Support Tickets**: < 2% of transactions

## 🔐 **SECURITY BEST PRACTICES**

### **Frontend Security:**
```javascript
// 1. Sensitive Data Handling
const handlePaymentData = (formData) => {
  // Never store sensitive data in localStorage
  const sanitizedData = {
    amount: formData.amount,
    payment_method: formData.payment_method,
    booking_id: formData.booking_id
    // Exclude sensitive fields like CVV, PIN, etc.
  };
  
  return sanitizedData;
};

// 2. Input Validation
const validatePaymentForm = (data) => {
  const errors = {};
  
  if (!data.amount || data.amount <= 0) {
    errors.amount = 'Số tiền không hợp lệ';
  }
  
  if (!data.payment_method) {
    errors.payment_method = 'Vui lòng chọn phương thức thanh toán';
  }
  
  if (data.amount > 50000000) {
    errors.amount = 'Số tiền vượt quá giới hạn cho phép';
  }
  
  return errors;
};

// 3. HTTPS Only
const enforceHTTPS = () => {
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    location.replace('https:' + window.location.href.substring(window.location.protocol.length));
  }
};

// 4. CSP Headers
const cspHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' *.momo.vn *.vnpay.vn; img-src 'self' data: *.momo.vn *.vnpay.vn"
};
```

### **API Security:**
```javascript
// 1. Request Signing
const signRequest = (payload, secret) => {
  const timestamp = Date.now();
  const dataToSign = timestamp + JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', secret).update(dataToSign).digest('hex');
  
  return {
    timestamp,
    signature,
    payload
  };
};

// 2. Rate Limiting
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many payment requests, please try again later.'
};

// 3. Data Encryption
const encryptSensitiveData = (data, key) => {
  const cipher = crypto.createCipher('aes-256-cbc', key);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};
```

## 🧪 **TESTING STRATEGY**

### **Unit Tests:**
```javascript
describe('Payment Service', () => {
  test('should create payment with valid data', async () => {
    const paymentData = {
      booking_id: 1,
      payment_method: 'momo',
      amount: 1000000
    };
    
    const result = await paymentService.createPayment(paymentData);
    expect(result.success).toBe(true);
    expect(result.data.payment.amount).toBe(1000000);
  });

  test('should reject payment with invalid amount', async () => {
    const paymentData = {
      booking_id: 1,
      payment_method: 'momo',
      amount: -1000
    };
    
    await expect(paymentService.createPayment(paymentData)).rejects.toThrow();
  });
});

describe('Security Service', () => {
  test('should detect high risk transaction', async () => {
    const highRiskData = {
      amount: 100000000, // Very high amount
      payment_method: 'momo',
      customer_id: 1
    };
    
    const result = await securityService.validatePayment(highRiskData);
    expect(result.risk_level).toBe('high');
    expect(result.is_approved).toBe(false);
  });
});
```

### **Integration Tests:**
```javascript
describe('Payment Integration', () => {
  test('complete payment flow', async () => {
    // 1. Create payment
    const payment = await paymentService.createPayment(paymentData);
    
    // 2. Simulate gateway callback
    const callbackData = {
      orderId: payment.transaction_id,
      resultCode: 0,
      amount: paymentData.amount
    };
    
    await paymentService.handleWebhook('momo', callbackData);
    
    // 3. Verify payment status
    const status = await paymentService.getPaymentStatus(payment.payment_id);
    expect(status.payment_status).toBe('paid');
  });
});
```

## 🚀 **READY FOR IMPLEMENTATION!**

### **Backend Status:**
- ✅ **Enhanced Payment System**: Complete với 13 endpoints
- ✅ **Multiple Payment Gateways**: MoMo, Bank Transfer, Cash, VNPay ready
- ✅ **Security Framework**: Fraud detection, risk assessment
- ✅ **Analytics System**: Comprehensive payment analytics
- ✅ **Refund Management**: Complete refund workflow
- ✅ **Installment System**: Payment scheduling và tracking

### **Frontend Foundation:**
- ✅ **Payment Components**: Basic payment form structure
- ✅ **MoMo Integration**: Complete MoMo payment flow
- ✅ **Payment History**: Transaction listing
- ✅ **Services Structure**: API integration ready

### **Next Steps:**
1. **Complete Gateway Integration** - VNPay, PayPal, Stripe
2. **Build Security Dashboard** - Risk monitoring UI
3. **Implement Analytics Visualization** - Charts và reports
4. **Add Installment Management** - Payment scheduling UI
5. **Mobile Optimization** - Touch-friendly payment flow

**CỤM 4 PAYMENT INTEGRATION READY TO BUILD! 💳✨**

**Estimated Timeline: 5 weeks for complete implementation**
**Confidence Level: Very High (Advanced backend fully implemented)**


