import { differenceInDays, parseISO, isWeekend, isValid } from "date-fns";
import { getSeason } from "./dateUtils";

// ==========================================
// BASE PRICE CALCULATIONS
// ==========================================

/**
 * Calculate base room price for a stay
 * @param {Object} params - Calculation parameters
 * @returns {Object} Price calculation result
 */
export const calculateBasePrice = (params) => {
  const {
    room,
    check_in_date,
    check_out_date,
    base_price_override = null,
  } = params;

  try {
    const checkIn = parseISO(check_in_date);
    const checkOut = parseISO(check_out_date);

    if (!isValid(checkIn) || !isValid(checkOut)) {
      throw new Error("Ngày không hợp lệ");
    }

    const nights = differenceInDays(checkOut, checkIn);
    if (nights < 1) {
      throw new Error("Số đêm phải ít nhất là 1");
    }

    const basePrice = base_price_override || room.price_per_night || 0;
    const totalBasePrice = basePrice * nights;

    return {
      base_price_per_night: basePrice,
      nights,
      total_base_price: totalBasePrice,
      dates: {
        check_in: check_in_date,
        check_out: check_out_date,
      },
    };
  } catch (error) {
    throw new Error(`Lỗi tính giá cơ bản: ${error.message}`);
  }
};

// ==========================================
// SEASONAL PRICING
// ==========================================

/**
 * Apply seasonal pricing adjustments
 * @param {Object} baseCalculation - Base price calculation
 * @param {Array} seasonalRules - Seasonal pricing rules
 * @returns {Object} Adjusted price calculation
 */
export const applySeasonalPricing = (baseCalculation, seasonalRules = []) => {
  if (!Array.isArray(seasonalRules) || seasonalRules.length === 0) {
    return {
      ...baseCalculation,
      seasonal_adjustments: [],
      seasonal_total: baseCalculation.total_base_price,
    };
  }

  const { check_in_date, check_out_date } = baseCalculation.dates;
  const checkIn = parseISO(check_in_date);
  const checkOut = parseISO(check_out_date);

  let seasonalTotal = 0;
  const adjustments = [];

  // Calculate price for each night
  for (
    let date = new Date(checkIn);
    date < checkOut;
    date.setDate(date.getDate() + 1)
  ) {
    const currentDate = new Date(date);
    const dateStr = currentDate.toISOString().split("T")[0];

    // Find applicable seasonal rule
    const applicableRule = findApplicableSeasonalRule(
      currentDate,
      seasonalRules
    );

    if (applicableRule) {
      const adjustedPrice =
        baseCalculation.base_price_per_night * applicableRule.multiplier;
      seasonalTotal += adjustedPrice;

      adjustments.push({
        date: dateStr,
        rule_name: applicableRule.season_name,
        base_price: baseCalculation.base_price_per_night,
        multiplier: applicableRule.multiplier,
        adjusted_price: adjustedPrice,
        adjustment_amount: adjustedPrice - baseCalculation.base_price_per_night,
      });
    } else {
      seasonalTotal += baseCalculation.base_price_per_night;
      adjustments.push({
        date: dateStr,
        rule_name: "Standard",
        base_price: baseCalculation.base_price_per_night,
        multiplier: 1.0,
        adjusted_price: baseCalculation.base_price_per_night,
        adjustment_amount: 0,
      });
    }
  }

  return {
    ...baseCalculation,
    seasonal_adjustments: adjustments,
    seasonal_total: seasonalTotal,
    total_seasonal_adjustment: seasonalTotal - baseCalculation.total_base_price,
  };
};

/**
 * Find applicable seasonal pricing rule for a date
 * @param {Date} date - Date to check
 * @param {Array} seasonalRules - Seasonal pricing rules
 * @returns {Object|null} Applicable rule or null
 */
const findApplicableSeasonalRule = (date, seasonalRules) => {
  // Sort rules by priority (higher priority first)
  const sortedRules = [...seasonalRules].sort(
    (a, b) => (b.priority || 0) - (a.priority || 0)
  );

  for (const rule of sortedRules) {
    if (rule.status !== "active") continue;

    const startDate = parseISO(rule.start_date);
    const endDate = parseISO(rule.end_date);

    if (isValid(startDate) && isValid(endDate)) {
      if (date >= startDate && date <= endDate) {
        return rule;
      }
    }
  }

  return null;
};

// ==========================================
// WEEKEND PRICING
// ==========================================

/**
 * Apply weekend pricing adjustments
 * @param {Object} calculation - Current price calculation
 * @param {Object} weekendRules - Weekend pricing rules
 * @returns {Object} Adjusted price calculation
 */
export const applyWeekendPricing = (calculation, weekendRules = {}) => {
  const { weekend_multiplier = 1.0, enabled = false } = weekendRules;

  if (!enabled || weekend_multiplier === 1.0) {
    return {
      ...calculation,
      weekend_adjustments: [],
      weekend_total: calculation.seasonal_total || calculation.total_base_price,
    };
  }

  const { check_in_date, check_out_date } = calculation.dates;
  const checkIn = parseISO(check_in_date);
  const checkOut = parseISO(check_out_date);

  let weekendTotal = 0;
  const adjustments = [];

  // Use seasonal adjustments if available, otherwise use base price
  const dailyPrices = calculation.seasonal_adjustments || [];

  for (let i = 0; i < calculation.nights; i++) {
    const currentDate = new Date(checkIn);
    currentDate.setDate(currentDate.getDate() + i);
    const dateStr = currentDate.toISOString().split("T")[0];

    const dailyPrice =
      dailyPrices[i]?.adjusted_price || calculation.base_price_per_night;
    const isWeekendDay = isWeekend(currentDate);

    if (isWeekendDay) {
      const adjustedPrice = dailyPrice * weekend_multiplier;
      weekendTotal += adjustedPrice;

      adjustments.push({
        date: dateStr,
        is_weekend: true,
        base_price: dailyPrice,
        multiplier: weekend_multiplier,
        adjusted_price: adjustedPrice,
        adjustment_amount: adjustedPrice - dailyPrice,
      });
    } else {
      weekendTotal += dailyPrice;
      adjustments.push({
        date: dateStr,
        is_weekend: false,
        base_price: dailyPrice,
        multiplier: 1.0,
        adjusted_price: dailyPrice,
        adjustment_amount: 0,
      });
    }
  }

  return {
    ...calculation,
    weekend_adjustments: adjustments,
    weekend_total: weekendTotal,
    total_weekend_adjustment:
      weekendTotal -
      (calculation.seasonal_total || calculation.total_base_price),
  };
};

// ==========================================
// GUEST PRICING
// ==========================================

/**
 * Calculate extra guest fees
 * @param {Object} params - Guest pricing parameters
 * @returns {Object} Guest fee calculation
 */
export const calculateGuestFees = (params) => {
  const {
    adults = 1,
    children = 0,
    infants = 0,
    room_capacity = {},
    guest_pricing = {},
    nights = 1,
  } = params;

  const { max_adults = 2, max_children = 2, max_infants = 1 } = room_capacity;

  const {
    extra_adult_fee = 0,
    extra_child_fee = 0,
    extra_infant_fee = 0,
    child_age_limit = 12,
    infant_age_limit = 2,
  } = guest_pricing;

  const fees = [];
  let totalGuestFee = 0;

  // Calculate extra adult fees
  if (adults > max_adults) {
    const extraAdults = adults - max_adults;
    const adultFee = extraAdults * extra_adult_fee * nights;
    totalGuestFee += adultFee;

    fees.push({
      type: "extra_adults",
      description: `${extraAdults} người lớn thêm`,
      quantity: extraAdults,
      unit_price: extra_adult_fee,
      nights,
      total: adultFee,
    });
  }

  // Calculate extra children fees
  if (children > max_children) {
    const extraChildren = children - max_children;
    const childFee = extraChildren * extra_child_fee * nights;
    totalGuestFee += childFee;

    fees.push({
      type: "extra_children",
      description: `${extraChildren} trẻ em thêm`,
      quantity: extraChildren,
      unit_price: extra_child_fee,
      nights,
      total: childFee,
    });
  }

  // Calculate extra infant fees
  if (infants > max_infants) {
    const extraInfants = infants - max_infants;
    const infantFee = extraInfants * extra_infant_fee * nights;
    totalGuestFee += infantFee;

    fees.push({
      type: "extra_infants",
      description: `${extraInfants} em bé thêm`,
      quantity: extraInfants,
      unit_price: extra_infant_fee,
      nights,
      total: infantFee,
    });
  }

  return {
    guest_fees: fees,
    total_guest_fee: totalGuestFee,
    guest_breakdown: {
      adults: {
        count: adults,
        max_included: max_adults,
        extra_count: Math.max(0, adults - max_adults),
        extra_fee: Math.max(0, adults - max_adults) * extra_adult_fee * nights,
      },
      children: {
        count: children,
        max_included: max_children,
        extra_count: Math.max(0, children - max_children),
        extra_fee:
          Math.max(0, children - max_children) * extra_child_fee * nights,
      },
      infants: {
        count: infants,
        max_included: max_infants,
        extra_count: Math.max(0, infants - max_infants),
        extra_fee:
          Math.max(0, infants - max_infants) * extra_infant_fee * nights,
      },
    },
  };
};

// ==========================================
// SERVICE FEES
// ==========================================

/**
 * Calculate extra service fees
 * @param {Array} services - Selected services
 * @param {number} nights - Number of nights
 * @param {number} guests - Total guests
 * @returns {Object} Service fee calculation
 */
export const calculateServiceFees = (services = [], nights = 1, guests = 1) => {
  if (!Array.isArray(services) || services.length === 0) {
    return {
      service_fees: [],
      total_service_fee: 0,
    };
  }

  const fees = [];
  let totalServiceFee = 0;

  services.forEach((service) => {
    const {
      service_id,
      service_name,
      price,
      pricing_type = "fixed", // fixed, per_night, per_person, per_person_per_night
      quantity = 1,
    } = service;

    let serviceFee = 0;

    switch (pricing_type) {
      case "fixed":
        serviceFee = price * quantity;
        break;
      case "per_night":
        serviceFee = price * quantity * nights;
        break;
      case "per_person":
        serviceFee = price * quantity * guests;
        break;
      case "per_person_per_night":
        serviceFee = price * quantity * guests * nights;
        break;
      default:
        serviceFee = price * quantity;
    }

    totalServiceFee += serviceFee;

    fees.push({
      service_id,
      service_name,
      unit_price: price,
      quantity,
      pricing_type,
      nights: pricing_type.includes("night") ? nights : 1,
      guests: pricing_type.includes("person") ? guests : 1,
      total: serviceFee,
      description: getServiceDescription(service, nights, guests),
    });
  });

  return {
    service_fees: fees,
    total_service_fee: totalServiceFee,
  };
};

/**
 * Generate service description based on pricing type
 * @param {Object} service - Service object
 * @param {number} nights - Number of nights
 * @param {number} guests - Number of guests
 * @returns {string} Service description
 */
const getServiceDescription = (service, nights, guests) => {
  const { service_name, pricing_type, quantity } = service;

  let description = `${service_name}`;

  if (quantity > 1) {
    description += ` (x${quantity})`;
  }

  switch (pricing_type) {
    case "per_night":
      description += ` - ${nights} đêm`;
      break;
    case "per_person":
      description += ` - ${guests} khách`;
      break;
    case "per_person_per_night":
      description += ` - ${guests} khách, ${nights} đêm`;
      break;
  }

  return description;
};

// ==========================================
// TAXES AND FEES
// ==========================================

/**
 * Calculate taxes and additional fees
 * @param {Object} params - Tax calculation parameters
 * @returns {Object} Tax calculation result
 */
export const calculateTaxesAndFees = (params) => {
  const {
    subtotal,
    tax_rules = [],
    cleaning_fee = 0,
    service_fee = 0,
    booking_fee = 0,
  } = params;

  const taxes = [];
  let totalTax = 0;

  // Calculate each tax
  tax_rules.forEach((rule) => {
    const {
      tax_name,
      tax_rate,
      tax_type = "percentage", // percentage, fixed
      applies_to = "subtotal", // subtotal, accommodation, services
      enabled = true,
    } = rule;

    if (!enabled) return;

    let taxAmount = 0;
    let taxBase = subtotal;

    // Determine tax base
    switch (applies_to) {
      case "accommodation":
        taxBase = subtotal - service_fee; // Assuming service fee is separate
        break;
      case "services":
        taxBase = service_fee;
        break;
      default:
        taxBase = subtotal;
    }

    // Calculate tax amount
    if (tax_type === "percentage") {
      taxAmount = (taxBase * tax_rate) / 100;
    } else {
      taxAmount = tax_rate;
    }

    totalTax += taxAmount;

    taxes.push({
      tax_name,
      tax_rate,
      tax_type,
      applies_to,
      tax_base: taxBase,
      tax_amount: taxAmount,
      description: getTaxDescription(rule, taxBase),
    });
  });

  return {
    taxes,
    total_tax: totalTax,
    cleaning_fee,
    service_fee: booking_fee,
    total_fees: cleaning_fee + booking_fee,
    total_tax_and_fees: totalTax + cleaning_fee + booking_fee,
  };
};

/**
 * Generate tax description
 * @param {Object} taxRule - Tax rule object
 * @param {number} taxBase - Tax base amount
 * @returns {string} Tax description
 */
const getTaxDescription = (taxRule, taxBase) => {
  const { tax_name, tax_rate, tax_type } = taxRule;

  if (tax_type === "percentage") {
    return `${tax_name} (${tax_rate}% trên ${formatPrice(taxBase)})`;
  } else {
    return `${tax_name} (phí cố định)`;
  }
};

// ==========================================
// DISCOUNTS
// ==========================================

/**
 * Apply discount codes and promotions
 * @param {Object} params - Discount parameters
 * @returns {Object} Discount calculation result
 */
export const applyDiscounts = (params) => {
  const { subtotal, discounts = [], discount_codes = [] } = params;

  const appliedDiscounts = [];
  let totalDiscount = 0;

  // Apply discount codes
  discount_codes.forEach((code) => {
    const {
      code: discountCode,
      discount_type = "percentage", // percentage, fixed, free_nights
      discount_value,
      max_discount_amount = null,
      min_order_amount = 0,
      applies_to = "total", // total, accommodation, services
      valid = true,
    } = code;

    if (!valid || subtotal < min_order_amount) return;

    let discountAmount = 0;
    let discountBase = subtotal;

    // Calculate discount amount
    switch (discount_type) {
      case "percentage":
        discountAmount = (discountBase * discount_value) / 100;
        if (max_discount_amount && discountAmount > max_discount_amount) {
          discountAmount = max_discount_amount;
        }
        break;
      case "fixed":
        discountAmount = Math.min(discount_value, discountBase);
        break;
      case "free_nights":
        // This would need more complex logic based on nightly rates
        discountAmount = 0; // Placeholder
        break;
    }

    totalDiscount += discountAmount;

    appliedDiscounts.push({
      type: "discount_code",
      code: discountCode,
      discount_type,
      discount_value,
      discount_base: discountBase,
      discount_amount: discountAmount,
      description: getDiscountDescription(code),
    });
  });

  // Apply automatic discounts
  discounts.forEach((discount) => {
    const {
      discount_name,
      discount_type,
      discount_value,
      conditions = {},
      enabled = true,
    } = discount;

    if (!enabled) return;

    // Check conditions (simplified)
    const meetsConditions = checkDiscountConditions(conditions, params);
    if (!meetsConditions) return;

    let discountAmount = 0;

    if (discount_type === "percentage") {
      discountAmount = (subtotal * discount_value) / 100;
    } else {
      discountAmount = Math.min(discount_value, subtotal);
    }

    totalDiscount += discountAmount;

    appliedDiscounts.push({
      type: "automatic_discount",
      discount_name,
      discount_type,
      discount_value,
      discount_amount: discountAmount,
      description: `${discount_name} - Giảm ${
        discount_type === "percentage"
          ? discount_value + "%"
          : formatPrice(discount_value)
      }`,
    });
  });

  return {
    applied_discounts: appliedDiscounts,
    total_discount: totalDiscount,
  };
};

/**
 * Generate discount description
 * @param {Object} discountCode - Discount code object
 * @returns {string} Discount description
 */
const getDiscountDescription = (discountCode) => {
  const { code, discount_type, discount_value } = discountCode;

  if (discount_type === "percentage") {
    return `Mã ${code} - Giảm ${discount_value}%`;
  } else {
    return `Mã ${code} - Giảm ${formatPrice(discount_value)}`;
  }
};

/**
 * Check if discount conditions are met
 * @param {Object} conditions - Discount conditions
 * @param {Object} params - Booking parameters
 * @returns {boolean} Conditions met
 */
const checkDiscountConditions = (conditions, params) => {
  // Simplified condition checking
  // In real implementation, this would check various conditions like:
  // - Minimum nights
  // - Booking date
  // - Room type
  // - Guest count
  // etc.
  return true;
};

// ==========================================
// COMPLETE PRICE CALCULATION
// ==========================================

/**
 * Calculate complete booking price
 * @param {Object} params - Complete calculation parameters
 * @returns {Object} Complete price calculation
 */
export const calculateCompletePrice = (params) => {
  try {
    const {
      room,
      check_in_date,
      check_out_date,
      adults = 1,
      children = 0,
      infants = 0,
      extra_services = [],
      seasonal_rules = [],
      weekend_rules = {},
      guest_pricing = {},
      tax_rules = [],
      discounts = [],
      discount_codes = [],
      fees = {},
    } = params;

    // Step 1: Calculate base price
    const baseCalculation = calculateBasePrice({
      room,
      check_in_date,
      check_out_date,
    });

    // Step 2: Apply seasonal pricing
    const seasonalCalculation = applySeasonalPricing(
      baseCalculation,
      seasonal_rules
    );

    // Step 3: Apply weekend pricing
    const weekendCalculation = applyWeekendPricing(
      seasonalCalculation,
      weekend_rules
    );

    // Step 4: Calculate guest fees
    const guestFeeCalculation = calculateGuestFees({
      adults,
      children,
      infants,
      room_capacity: room.capacity || {},
      guest_pricing,
      nights: baseCalculation.nights,
    });

    // Step 5: Calculate service fees
    const serviceFeeCalculation = calculateServiceFees(
      extra_services,
      baseCalculation.nights,
      adults + children + infants
    );

    // Step 6: Calculate subtotal
    const accommodationTotal =
      weekendCalculation.weekend_total ||
      weekendCalculation.seasonal_total ||
      baseCalculation.total_base_price;
    const subtotal =
      accommodationTotal +
      guestFeeCalculation.total_guest_fee +
      serviceFeeCalculation.total_service_fee;

    // Step 7: Calculate taxes and fees
    const taxCalculation = calculateTaxesAndFees({
      subtotal,
      tax_rules,
      cleaning_fee: fees.cleaning_fee || 0,
      service_fee: fees.booking_fee || 0,
      booking_fee: fees.booking_fee || 0,
    });

    // Step 8: Apply discounts
    const totalBeforeDiscounts = subtotal + taxCalculation.total_tax_and_fees;
    const discountCalculation = applyDiscounts({
      subtotal: totalBeforeDiscounts,
      discounts,
      discount_codes,
    });

    // Step 9: Calculate final total
    const finalTotal =
      totalBeforeDiscounts - discountCalculation.total_discount;

    return {
      // Base information
      room_id: room.room_id,
      room_name: room.room_name || room.room_number,
      dates: baseCalculation.dates,
      nights: baseCalculation.nights,
      guests: {
        adults,
        children,
        infants,
        total: adults + children + infants,
      },

      // Price breakdown
      base_calculation: baseCalculation,
      seasonal_calculation: seasonalCalculation,
      weekend_calculation: weekendCalculation,
      guest_fee_calculation: guestFeeCalculation,
      service_fee_calculation: serviceFeeCalculation,
      tax_calculation: taxCalculation,
      discount_calculation: discountCalculation,

      // Summary totals
      accommodation_total: accommodationTotal,
      subtotal,
      total_before_discounts: totalBeforeDiscounts,
      total_discount: discountCalculation.total_discount,
      final_total: finalTotal,

      // Formatted amounts
      formatted_amounts: {
        accommodation_total: formatPrice(accommodationTotal),
        subtotal: formatPrice(subtotal),
        total_before_discounts: formatPrice(totalBeforeDiscounts),
        total_discount: formatPrice(discountCalculation.total_discount),
        final_total: formatPrice(finalTotal),
      },

      // Payment breakdown
      payment_breakdown: generatePaymentBreakdown({
        accommodationTotal,
        guestFees: guestFeeCalculation.total_guest_fee,
        serviceFees: serviceFeeCalculation.total_service_fee,
        taxes: taxCalculation.total_tax,
        fees: taxCalculation.total_fees,
        discounts: discountCalculation.total_discount,
        finalTotal,
      }),
    };
  } catch (error) {
    throw new Error(`Lỗi tính toán giá: ${error.message}`);
  }
};

/**
 * Generate payment breakdown for display
 * @param {Object} amounts - Amount breakdown
 * @returns {Array} Payment breakdown items
 */
const generatePaymentBreakdown = (amounts) => {
  const breakdown = [];

  breakdown.push({
    label: "Tiền phòng",
    amount: amounts.accommodationTotal,
    type: "accommodation",
  });

  if (amounts.guestFees > 0) {
    breakdown.push({
      label: "Phí khách thêm",
      amount: amounts.guestFees,
      type: "guest_fees",
    });
  }

  if (amounts.serviceFees > 0) {
    breakdown.push({
      label: "Dịch vụ thêm",
      amount: amounts.serviceFees,
      type: "service_fees",
    });
  }

  if (amounts.taxes > 0) {
    breakdown.push({
      label: "Thuế",
      amount: amounts.taxes,
      type: "taxes",
    });
  }

  if (amounts.fees > 0) {
    breakdown.push({
      label: "Phí dịch vụ",
      amount: amounts.fees,
      type: "fees",
    });
  }

  if (amounts.discounts > 0) {
    breakdown.push({
      label: "Giảm giá",
      amount: -amounts.discounts,
      type: "discounts",
    });
  }

  breakdown.push({
    label: "Tổng cộng",
    amount: amounts.finalTotal,
    type: "total",
    isTotal: true,
  });

  return breakdown.map((item) => ({
    ...item,
    formatted_amount: formatPrice(Math.abs(item.amount)),
    is_negative: item.amount < 0,
  }));
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Format price for display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted price
 */
export const formatPrice = (amount, currency = "VND") => {
  if (typeof amount !== "number" || isNaN(amount)) {
    return "0đ";
  }

  if (currency === "VND") {
    return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

/**
 * Validate price calculation parameters
 * @param {Object} params - Parameters to validate
 * @returns {Object} Validation result
 */
export const validatePriceCalculationParams = (params) => {
  const errors = [];

  if (!params.room || !params.room.room_id) {
    errors.push("Thông tin phòng không hợp lệ");
  }

  if (!params.check_in_date || !params.check_out_date) {
    errors.push("Ngày check-in và check-out là bắt buộc");
  }

  if (params.adults < 1) {
    errors.push("Phải có ít nhất 1 người lớn");
  }

  try {
    const checkIn = parseISO(params.check_in_date);
    const checkOut = parseISO(params.check_out_date);

    if (!isValid(checkIn) || !isValid(checkOut)) {
      errors.push("Ngày không hợp lệ");
    } else if (differenceInDays(checkOut, checkIn) < 1) {
      errors.push("Thời gian lưu trú phải ít nhất 1 đêm");
    }
  } catch (error) {
    errors.push("Lỗi xử lý ngày tháng");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default {
  calculateBasePrice,
  applySeasonalPricing,
  applyWeekendPricing,
  calculateGuestFees,
  calculateServiceFees,
  calculateTaxesAndFees,
  applyDiscounts,
  calculateCompletePrice,
  formatPrice,
  validatePriceCalculationParams,
};


