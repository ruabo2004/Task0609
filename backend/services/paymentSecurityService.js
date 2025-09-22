const { pool } = require('../config/database');
const crypto = require('crypto');

class PaymentSecurityService {
  constructor() {
    this.fraudRules = {
      maxDailyAmount: 50000000, // 50M VND per day
      maxTransactionAmount: 20000000, // 20M VND per transaction
      maxDailyTransactions: 10,
      maxFailedAttempts: 5,
      velocityCheckWindow: 3600, // 1 hour in seconds
      duplicateCheckWindow: 300 // 5 minutes in seconds
    };
  }

  async validatePaymentSecurity(customerId, paymentData) {
    const {
      amount,
      payment_method,
      booking_id,
      user_agent,
      ip_address
    } = paymentData;

    const securityChecks = {
      amount_limit: await this.checkAmountLimits(customerId, amount),
      daily_limit: await this.checkDailyLimits(customerId, amount),
      velocity_check: await this.checkPaymentVelocity(customerId),
      duplicate_check: await this.checkDuplicatePayment(customerId, booking_id, amount),
      failed_attempts: await this.checkFailedAttempts(customerId),
      suspicious_activity: await this.checkSuspiciousActivity(customerId, ip_address),
      device_fingerprint: await this.checkDeviceFingerprint(customerId, user_agent, ip_address)
    };

    const riskScore = this.calculateRiskScore(securityChecks);
    const riskLevel = this.getRiskLevel(riskScore);

    const securityResult = {
      is_approved: riskLevel !== 'high',
      risk_score: riskScore,
      risk_level: riskLevel,
      checks: securityChecks,
      recommendations: this.getSecurityRecommendations(securityChecks, riskLevel)
    };

    if (!securityResult.is_approved) {
      await this.logSecurityEvent(customerId, 'payment_blocked', {
        reason: 'High risk score',
        risk_score: riskScore,
        failed_checks: Object.keys(securityChecks).filter(key => !securityChecks[key].passed),
        payment_data: paymentData
      });
    }

    return securityResult;
  }

  async checkAmountLimits(customerId, amount) {
    try {
      const isWithinLimit = amount <= this.fraudRules.maxTransactionAmount;
      
      return {
        passed: isWithinLimit,
        details: {
          amount,
          limit: this.fraudRules.maxTransactionAmount,
          message: isWithinLimit ? 'Amount within limits' : 'Amount exceeds transaction limit'
        }
      };
    } catch (error) {
      return {
        passed: false,
        details: { error: error.message }
      };
    }
  }

  async checkDailyLimits(customerId, amount) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
           COUNT(*) as daily_transactions,
           COALESCE(SUM(amount), 0) as daily_amount
         FROM payment_transactions 
         WHERE customer_id = ? 
         AND DATE(created_at) = CURDATE()
         AND status = 'completed'`,
        [customerId]
      );

      const { daily_transactions, daily_amount } = rows[0];
      const newDailyAmount = daily_amount + amount;

      const amountCheck = newDailyAmount <= this.fraudRules.maxDailyAmount;
      const transactionCheck = daily_transactions < this.fraudRules.maxDailyTransactions;

      return {
        passed: amountCheck && transactionCheck,
        details: {
          current_daily_amount: daily_amount,
          new_daily_amount: newDailyAmount,
          daily_amount_limit: this.fraudRules.maxDailyAmount,
          current_daily_transactions: daily_transactions,
          daily_transaction_limit: this.fraudRules.maxDailyTransactions,
          amount_within_limit: amountCheck,
          transaction_count_within_limit: transactionCheck
        }
      };
    } catch (error) {
      return {
        passed: false,
        details: { error: error.message }
      };
    }
  }

  async checkPaymentVelocity(customerId) {
    try {
      const [rows] = await pool.execute(
        `SELECT COUNT(*) as recent_payments
         FROM payment_transactions 
         WHERE customer_id = ? 
         AND created_at >= DATE_SUB(NOW(), INTERVAL ? SECOND)`,
        [customerId, this.fraudRules.velocityCheckWindow]
      );

      const recentPayments = rows[0].recent_payments;
      const isWithinVelocity = recentPayments < 3; // Max 3 payments per hour

      return {
        passed: isWithinVelocity,
        details: {
          recent_payments: recentPayments,
          time_window: this.fraudRules.velocityCheckWindow,
          velocity_limit: 3,
          message: isWithinVelocity ? 'Payment velocity normal' : 'Too many recent payments'
        }
      };
    } catch (error) {
      return {
        passed: false,
        details: { error: error.message }
      };
    }
  }

  async checkDuplicatePayment(customerId, bookingId, amount) {
    try {
      const [rows] = await pool.execute(
        `SELECT COUNT(*) as duplicate_count
         FROM payment_transactions 
         WHERE customer_id = ? 
         AND booking_id = ?
         AND amount = ?
         AND created_at >= DATE_SUB(NOW(), INTERVAL ? SECOND)
         AND status IN ('pending', 'completed')`,
        [customerId, bookingId, amount, this.fraudRules.duplicateCheckWindow]
      );

      const duplicateCount = rows[0].duplicate_count;
      const isNotDuplicate = duplicateCount === 0;

      return {
        passed: isNotDuplicate,
        details: {
          duplicate_count: duplicateCount,
          time_window: this.fraudRules.duplicateCheckWindow,
          message: isNotDuplicate ? 'No duplicate payments found' : 'Potential duplicate payment detected'
        }
      };
    } catch (error) {
      return {
        passed: false,
        details: { error: error.message }
      };
    }
  }

  async checkFailedAttempts(customerId) {
    try {
      const [rows] = await pool.execute(
        `SELECT COUNT(*) as failed_attempts
         FROM payment_transactions 
         WHERE customer_id = ? 
         AND status = 'failed'
         AND created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)`,
        [customerId]
      );

      const failedAttempts = rows[0].failed_attempts;
      const isWithinLimit = failedAttempts < this.fraudRules.maxFailedAttempts;

      return {
        passed: isWithinLimit,
        details: {
          failed_attempts: failedAttempts,
          limit: this.fraudRules.maxFailedAttempts,
          time_window: '1 hour',
          message: isWithinLimit ? 'Failed attempts within limit' : 'Too many failed payment attempts'
        }
      };
    } catch (error) {
      return {
        passed: false,
        details: { error: error.message }
      };
    }
  }

  async checkSuspiciousActivity(customerId, ipAddress) {
    try {
      const [ipRows] = await pool.execute(
        `SELECT COUNT(*) as ip_usage_count
         FROM payment_transactions 
         WHERE customer_id != ? 
         AND JSON_EXTRACT(gateway_response, '$.ip_address') = ?
         AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`,
        [customerId, ipAddress]
      );

      const [timeRows] = await pool.execute(
        `SELECT COUNT(*) as off_hours_payments
         FROM payment_transactions 
         WHERE customer_id = ?
         AND HOUR(created_at) BETWEEN 0 AND 5
         AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
        [customerId]
      );

      const ipUsageCount = ipRows[0].ip_usage_count;
      const offHoursPayments = timeRows[0].off_hours_payments;

      const isNotSuspicious = ipUsageCount < 5 && offHoursPayments < 3;

      return {
        passed: isNotSuspicious,
        details: {
          ip_usage_by_others: ipUsageCount,
          off_hours_payments: offHoursPayments,
          suspicious_indicators: {
            shared_ip: ipUsageCount >= 5,
            unusual_timing: offHoursPayments >= 3
          },
          message: isNotSuspicious ? 'No suspicious activity detected' : 'Suspicious activity patterns detected'
        }
      };
    } catch (error) {
      return {
        passed: true, // Don't block on error
        details: { error: error.message, note: 'Check skipped due to error' }
      };
    }
  }

  async checkDeviceFingerprint(customerId, userAgent, ipAddress) {
    try {
      const deviceFingerprint = this.generateDeviceFingerprint(userAgent, ipAddress);

      const [rows] = await pool.execute(
        `SELECT COUNT(*) as device_usage_count
         FROM payment_transactions 
         WHERE customer_id = ?
         AND JSON_EXTRACT(gateway_response, '$.device_fingerprint') = ?
         AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
        [customerId, deviceFingerprint]
      );

      const deviceUsageCount = rows[0].device_usage_count;
      const isKnownDevice = deviceUsageCount > 0;

      return {
        passed: true, // Don't block based on device alone
        details: {
          device_fingerprint: deviceFingerprint.substring(0, 8) + '...',
          is_known_device: isKnownDevice,
          usage_count: deviceUsageCount,
          risk_factor: isKnownDevice ? 'low' : 'medium',
          message: isKnownDevice ? 'Known device' : 'New device detected'
        }
      };
    } catch (error) {
      return {
        passed: true,
        details: { error: error.message }
      };
    }
  }

  generateDeviceFingerprint(userAgent, ipAddress) {
    const data = `${userAgent}|${ipAddress}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  calculateRiskScore(securityChecks) {
    const weights = {
      amount_limit: 30,
      daily_limit: 25,
      velocity_check: 20,
      duplicate_check: 15,
      failed_attempts: 35,
      suspicious_activity: 25,
      device_fingerprint: 10
    };

    let totalScore = 0;
    let maxPossibleScore = 0;

    Object.keys(weights).forEach(check => {
      maxPossibleScore += weights[check];
      if (!securityChecks[check]?.passed) {
        totalScore += weights[check];
      }
    });

    return Math.round((totalScore / maxPossibleScore) * 100);
  }

  getRiskLevel(riskScore) {
    if (riskScore <= 30) return 'low';
    if (riskScore <= 60) return 'medium';
    return 'high';
  }

  getSecurityRecommendations(securityChecks, riskLevel) {
    const recommendations = [];

    if (!securityChecks.amount_limit?.passed) {
      recommendations.push({
        type: 'amount_limit',
        message: 'Transaction amount exceeds limits',
        action: 'Consider splitting into smaller transactions'
      });
    }

    if (!securityChecks.daily_limit?.passed) {
      recommendations.push({
        type: 'daily_limit',
        message: 'Daily transaction limits exceeded',
        action: 'Try again tomorrow or contact support for limit increase'
      });
    }

    if (!securityChecks.velocity_check?.passed) {
      recommendations.push({
        type: 'velocity',
        message: 'Too many recent transactions',
        action: 'Wait before making another payment'
      });
    }

    if (!securityChecks.duplicate_check?.passed) {
      recommendations.push({
        type: 'duplicate',
        message: 'Possible duplicate payment',
        action: 'Check if payment was already processed'
      });
    }

    if (!securityChecks.failed_attempts?.passed) {
      recommendations.push({
        type: 'failed_attempts',
        message: 'Multiple failed payment attempts',
        action: 'Verify payment details or try different payment method'
      });
    }

    if (riskLevel === 'high') {
      recommendations.push({
        type: 'high_risk',
        message: 'High risk transaction detected',
        action: 'Contact customer support for manual verification'
      });
    }

    return recommendations;
  }

  async logSecurityEvent(customerId, eventType, eventData) {
    try {
      await pool.execute(
        `INSERT INTO security_logs 
         (customer_id, event_type, event_data, ip_address, user_agent, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          customerId,
          eventType,
          JSON.stringify(eventData),
          eventData.ip_address || null,
          eventData.user_agent || null
        ]
      );
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  async getSecurityReport(customerId, timeframe = '30d') {
    try {
      let dateCondition = '';
      if (timeframe === '7d') {
        dateCondition = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
      } else if (timeframe === '30d') {
        dateCondition = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
      }

      const [securityEvents] = await pool.execute(
        `SELECT 
           event_type,
           COUNT(*) as event_count,
           MAX(created_at) as last_occurrence
         FROM security_logs 
         WHERE customer_id = ? ${dateCondition}
         GROUP BY event_type
         ORDER BY event_count DESC`,
        [customerId]
      );

      const [transactionSummary] = await pool.execute(
        `SELECT 
           COUNT(*) as total_transactions,
           COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_transactions,
           COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_transactions,
           COALESCE(SUM(CASE WHEN status = 'completed' THEN amount END), 0) as total_amount
         FROM payment_transactions 
         WHERE customer_id = ? ${dateCondition}`,
        [customerId]
      );

      const successRate = transactionSummary[0].total_transactions > 0
        ? (transactionSummary[0].successful_transactions / transactionSummary[0].total_transactions * 100).toFixed(2)
        : 0;

      return {
        timeframe,
        security_events: securityEvents,
        transaction_summary: {
          ...transactionSummary[0],
          success_rate: successRate
        },
        risk_assessment: {
          overall_risk: successRate > 90 ? 'low' : successRate > 70 ? 'medium' : 'high',
          trust_score: Math.min(100, successRate + 10)
        }
      };
    } catch (error) {
      throw new Error(`Failed to generate security report: ${error.message}`);
    }
  }

  async validatePaymentSignature(payload, signature, secret) {
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(computedSignature, 'hex')
    );
  }

  encryptSensitiveData(data, key) {
    const cipher = crypto.createCipher('aes-256-cbc', key);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  decryptSensitiveData(encryptedData, key) {
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  }
}

module.exports = new PaymentSecurityService();


