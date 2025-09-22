const { pool } = require("../config/database");

class Analytics {
  /**
   * Get dashboard overview analytics
   */
  static async getDashboardOverview(timeframe = "30d") {
    try {
      let dateFilter = "";

      switch (timeframe) {
        case "7d":
          dateFilter =
            "DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
          break;
        case "30d":
          dateFilter =
            "DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
          break;
        case "90d":
          dateFilter =
            "DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)";
          break;
        case "1y":
          dateFilter =
            "DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)";
          break;
        default:
          dateFilter =
            "DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
      }

      // Total revenue from bookings
      const [revenueRows] = await pool.execute(`
        SELECT 
          SUM(total_amount) as total_revenue,
          COUNT(*) as total_bookings,
          AVG(total_amount) as avg_booking_value
        FROM bookings 
        WHERE ${dateFilter} AND booking_status IN ('confirmed', 'checked_in', 'checked_out', 'completed')
      `);

      // Additional services revenue
      const [servicesRows] = await pool.execute(`
        SELECT 
          SUM(total_price) as services_revenue,
          COUNT(*) as services_count
        FROM booking_services 
        WHERE ${dateFilter} AND status IN ('confirmed', 'completed')
      `);

      // Occupancy rate for current period
      const occupancyData = await this.getOccupancyRate(
        this.getDateFromTimeframe(timeframe),
        new Date(),
        null,
        "total"
      );

      // Customer metrics
      const [customerRows] = await pool.execute(`
        SELECT 
          COUNT(*) as new_customers,
          COUNT(DISTINCT customer_id) as unique_customers
        FROM customers 
        WHERE ${dateFilter.replace("created_at", "customers.created_at")}
      `);

      // Booking status breakdown
      const [statusRows] = await pool.execute(`
        SELECT 
          booking_status,
          COUNT(*) as count
        FROM bookings 
        WHERE ${dateFilter}
        GROUP BY booking_status
      `);

      // Top performing rooms
      const [topRoomsRows] = await pool.execute(`
        SELECT 
          r.room_id,
          r.room_number,
          rt.type_name,
          COUNT(b.booking_id) as booking_count,
          SUM(b.total_amount) as revenue,
          AVG(rev.rating) as avg_rating
        FROM rooms r
        JOIN room_types rt ON r.room_type_id = rt.room_type_id
        LEFT JOIN bookings b ON r.room_id = b.room_id AND ${dateFilter.replace(
          "created_at",
          "b.created_at"
        )}
          AND b.booking_status IN ('confirmed', 'checked_in', 'checked_out', 'completed')
        LEFT JOIN reviews rev ON b.booking_id = rev.booking_id AND rev.review_status = 'approved'
        GROUP BY r.room_id, r.room_number, rt.type_name
        ORDER BY revenue DESC, booking_count DESC
        LIMIT 5
      `);

      return {
        timeframe,
        period: {
          start_date: this.getDateFromTimeframe(timeframe)
            .toISOString()
            .split("T")[0],
          end_date: new Date().toISOString().split("T")[0],
        },
        revenue_metrics: {
          total_revenue: parseFloat(revenueRows[0].total_revenue || 0),
          services_revenue: parseFloat(servicesRows[0].services_revenue || 0),
          total_bookings: parseInt(revenueRows[0].total_bookings || 0),
          avg_booking_value: parseFloat(revenueRows[0].avg_booking_value || 0),
          services_count: parseInt(servicesRows[0].services_count || 0),
        },
        occupancy_metrics: occupancyData,
        customer_metrics: {
          new_customers: parseInt(customerRows[0].new_customers || 0),
          unique_customers: parseInt(customerRows[0].unique_customers || 0),
        },
        booking_status_breakdown: statusRows.map((row) => ({
          status: row.booking_status,
          count: parseInt(row.count),
        })),
        top_performing_rooms: topRoomsRows.map((row) => ({
          room_id: row.room_id,
          room_number: row.room_number,
          room_type: row.type_name,
          booking_count: parseInt(row.booking_count || 0),
          revenue: parseFloat(row.revenue || 0),
          avg_rating: parseFloat(row.avg_rating || 0),
        })),
      };
    } catch (error) {
      throw new Error(`Error getting dashboard analytics: ${error.message}`);
    }
  }

  /**
   * Get occupancy rate analytics
   */
  static async getOccupancyRate(
    start_date,
    end_date,
    room_type_id = null,
    granularity = "daily"
  ) {
    try {
      let roomFilter = "";
      let roomJoin = "";

      if (room_type_id) {
        roomFilter = "AND r.room_type_id = ?";
        roomJoin = "JOIN rooms r ON ra.room_id = r.room_id";
      }

      // Get total available room-nights
      const totalRoomsQuery = room_type_id
        ? "SELECT COUNT(*) as total FROM rooms WHERE room_type_id = ?"
        : "SELECT COUNT(*) as total FROM rooms";

      const totalRoomsParams = room_type_id ? [room_type_id] : [];
      const [totalRoomsRows] = await pool.execute(
        totalRoomsQuery,
        totalRoomsParams
      );
      const totalRooms = totalRoomsRows[0].total;

      const daysDiff = Math.ceil(
        (end_date - start_date) / (1000 * 60 * 60 * 24)
      );
      const totalRoomNights = totalRooms * daysDiff;

      if (granularity === "total") {
        // Get total occupancy for the period
        const bookedQuery = `
          SELECT COUNT(*) as booked_nights
          FROM room_availability ra
          ${roomJoin}
          WHERE ra.date BETWEEN ? AND ? 
            AND ra.status = 'booked'
            ${roomFilter}
        `;

        const params = [
          start_date.toISOString().split("T")[0],
          end_date.toISOString().split("T")[0],
        ];
        if (room_type_id) params.push(room_type_id);

        const [bookedRows] = await pool.execute(bookedQuery, params);
        const bookedNights = bookedRows[0].booked_nights;

        const occupancyRate =
          totalRoomNights > 0 ? (bookedNights / totalRoomNights) * 100 : 0;

        return {
          period: {
            start_date: start_date.toISOString().split("T")[0],
            end_date: end_date.toISOString().split("T")[0],
            total_days: daysDiff,
          },
          room_type_id,
          total_rooms: totalRooms,
          total_room_nights: totalRoomNights,
          booked_nights: bookedNights,
          occupancy_rate: Math.round(occupancyRate * 100) / 100,
          granularity: "total",
        };
      }

      // Daily or other granularity occupancy
      const occupancyData = [];
      const currentDate = new Date(start_date);

      while (currentDate <= end_date) {
        const dateStr = currentDate.toISOString().split("T")[0];

        const bookedQuery = `
          SELECT COUNT(*) as booked_rooms
          FROM room_availability ra
          ${roomJoin}
          WHERE ra.date = ? 
            AND ra.status = 'booked'
            ${roomFilter}
        `;

        const params = [dateStr];
        if (room_type_id) params.push(room_type_id);

        const [dayBookedRows] = await pool.execute(bookedQuery, params);
        const bookedRooms = dayBookedRows[0].booked_rooms;

        const dailyOccupancyRate =
          totalRooms > 0 ? (bookedRooms / totalRooms) * 100 : 0;

        occupancyData.push({
          date: dateStr,
          total_rooms: totalRooms,
          booked_rooms: bookedRooms,
          available_rooms: totalRooms - bookedRooms,
          occupancy_rate: Math.round(dailyOccupancyRate * 100) / 100,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Calculate overall statistics
      const avgOccupancyRate =
        occupancyData.reduce((sum, day) => sum + day.occupancy_rate, 0) /
        occupancyData.length;
      const totalBookedNights = occupancyData.reduce(
        (sum, day) => sum + day.booked_rooms,
        0
      );

      return {
        period: {
          start_date: start_date.toISOString().split("T")[0],
          end_date: end_date.toISOString().split("T")[0],
          total_days: daysDiff,
        },
        room_type_id,
        summary: {
          total_rooms: totalRooms,
          total_room_nights: totalRoomNights,
          booked_nights: totalBookedNights,
          avg_occupancy_rate: Math.round(avgOccupancyRate * 100) / 100,
          peak_occupancy: Math.max(
            ...occupancyData.map((d) => d.occupancy_rate)
          ),
          lowest_occupancy: Math.min(
            ...occupancyData.map((d) => d.occupancy_rate)
          ),
        },
        daily_data: occupancyData,
        granularity,
      };
    } catch (error) {
      throw new Error(`Error calculating occupancy rate: ${error.message}`);
    }
  }

  /**
   * Get revenue analytics
   */
  static async getRevenueAnalytics(
    start_date,
    end_date,
    granularity = "daily",
    includeServices = true
  ) {
    try {
      const revenueData = [];
      const currentDate = new Date(start_date);

      let dateGrouping;
      switch (granularity) {
        case "monthly":
          dateGrouping = 'DATE_FORMAT(created_at, "%Y-%m")';
          break;
        case "weekly":
          dateGrouping = "YEARWEEK(created_at)";
          break;
        default:
          dateGrouping = "DATE(created_at)";
      }

      // Booking revenue
      const [bookingRevenueRows] = await pool.execute(
        `
        SELECT 
          ${dateGrouping} as period,
          SUM(total_amount) as booking_revenue,
          COUNT(*) as booking_count,
          AVG(total_amount) as avg_booking_value
        FROM bookings 
        WHERE DATE(created_at) BETWEEN ? AND ?
          AND booking_status IN ('confirmed', 'checked_in', 'checked_out', 'completed')
        GROUP BY ${dateGrouping}
        ORDER BY period
      `,
        [
          start_date.toISOString().split("T")[0],
          end_date.toISOString().split("T")[0],
        ]
      );

      let servicesRevenueRows = [];
      if (includeServices) {
        [servicesRevenueRows] = await pool.execute(
          `
          SELECT 
            ${dateGrouping} as period,
            SUM(total_price) as services_revenue,
            COUNT(*) as services_count
          FROM booking_services 
          WHERE DATE(created_at) BETWEEN ? AND ?
            AND status IN ('confirmed', 'completed')
          GROUP BY ${dateGrouping}
          ORDER BY period
        `,
          [
            start_date.toISOString().split("T")[0],
            end_date.toISOString().split("T")[0],
          ]
        );
      }

      // Combine data
      const periods = new Set([
        ...bookingRevenueRows.map((row) => row.period),
        ...servicesRevenueRows.map((row) => row.period),
      ]);

      periods.forEach((period) => {
        const bookingData =
          bookingRevenueRows.find((row) => row.period === period) || {};
        const servicesData =
          servicesRevenueRows.find((row) => row.period === period) || {};

        const bookingRevenue = parseFloat(bookingData.booking_revenue || 0);
        const servicesRevenue = parseFloat(servicesData.services_revenue || 0);

        revenueData.push({
          period,
          booking_revenue: bookingRevenue,
          services_revenue: servicesRevenue,
          total_revenue: bookingRevenue + servicesRevenue,
          booking_count: parseInt(bookingData.booking_count || 0),
          services_count: parseInt(servicesData.services_count || 0),
          avg_booking_value: parseFloat(bookingData.avg_booking_value || 0),
        });
      });

      // Calculate totals
      const totalBookingRevenue = revenueData.reduce(
        (sum, item) => sum + item.booking_revenue,
        0
      );
      const totalServicesRevenue = revenueData.reduce(
        (sum, item) => sum + item.services_revenue,
        0
      );
      const totalBookings = revenueData.reduce(
        (sum, item) => sum + item.booking_count,
        0
      );

      return {
        period: {
          start_date: start_date.toISOString().split("T")[0],
          end_date: end_date.toISOString().split("T")[0],
        },
        granularity,
        include_services: includeServices,
        summary: {
          total_booking_revenue: totalBookingRevenue,
          total_services_revenue: totalServicesRevenue,
          total_revenue: totalBookingRevenue + totalServicesRevenue,
          total_bookings: totalBookings,
          avg_revenue_per_booking:
            totalBookings > 0 ? totalBookingRevenue / totalBookings : 0,
        },
        data: revenueData.sort((a, b) => a.period.localeCompare(b.period)),
      };
    } catch (error) {
      throw new Error(`Error getting revenue analytics: ${error.message}`);
    }
  }

  /**
   * Get booking analytics
   */
  static async getBookingAnalytics(
    start_date,
    end_date,
    granularity = "daily"
  ) {
    try {
      let dateGrouping;
      switch (granularity) {
        case "monthly":
          dateGrouping = 'DATE_FORMAT(created_at, "%Y-%m")';
          break;
        case "weekly":
          dateGrouping = "YEARWEEK(created_at)";
          break;
        default:
          dateGrouping = "DATE(created_at)";
      }

      // Booking trends
      const [trendRows] = await pool.execute(
        `
        SELECT 
          ${dateGrouping} as period,
          COUNT(*) as total_bookings,
          COUNT(CASE WHEN booking_status = 'confirmed' THEN 1 END) as confirmed_bookings,
          COUNT(CASE WHEN booking_status = 'cancelled' THEN 1 END) as cancelled_bookings,
          AVG(DATEDIFF(check_out_date, check_in_date)) as avg_stay_duration,
          AVG(number_of_guests) as avg_guests
        FROM bookings 
        WHERE DATE(created_at) BETWEEN ? AND ?
        GROUP BY ${dateGrouping}
        ORDER BY period
      `,
        [
          start_date.toISOString().split("T")[0],
          end_date.toISOString().split("T")[0],
        ]
      );

      // Booking source analysis
      const [sourceRows] = await pool.execute(
        `
        SELECT 
          COALESCE(booking_source, 'Direct') as source,
          COUNT(*) as count,
          SUM(total_amount) as revenue
        FROM bookings 
        WHERE DATE(created_at) BETWEEN ? AND ?
          AND booking_status IN ('confirmed', 'checked_in', 'checked_out', 'completed')
        GROUP BY booking_source
        ORDER BY count DESC
      `,
        [
          start_date.toISOString().split("T")[0],
          end_date.toISOString().split("T")[0],
        ]
      );

      // Room type performance
      const [roomTypeRows] = await pool.execute(
        `
        SELECT 
          rt.type_name,
          COUNT(b.booking_id) as booking_count,
          SUM(b.total_amount) as revenue,
          AVG(b.total_amount) as avg_booking_value
        FROM bookings b
        JOIN rooms r ON b.room_id = r.room_id
        JOIN room_types rt ON r.room_type_id = rt.room_type_id
        WHERE DATE(b.created_at) BETWEEN ? AND ?
          AND b.booking_status IN ('confirmed', 'checked_in', 'checked_out', 'completed')
        GROUP BY rt.room_type_id, rt.type_name
        ORDER BY revenue DESC
      `,
        [
          start_date.toISOString().split("T")[0],
          end_date.toISOString().split("T")[0],
        ]
      );

      return {
        period: {
          start_date: start_date.toISOString().split("T")[0],
          end_date: end_date.toISOString().split("T")[0],
        },
        granularity,
        trends: trendRows.map((row) => ({
          period: row.period,
          total_bookings: parseInt(row.total_bookings),
          confirmed_bookings: parseInt(row.confirmed_bookings),
          cancelled_bookings: parseInt(row.cancelled_bookings),
          cancellation_rate:
            row.total_bookings > 0
              ? (row.cancelled_bookings / row.total_bookings) * 100
              : 0,
          avg_stay_duration: parseFloat(row.avg_stay_duration || 0),
          avg_guests: parseFloat(row.avg_guests || 0),
        })),
        booking_sources: sourceRows.map((row) => ({
          source: row.source,
          count: parseInt(row.count),
          revenue: parseFloat(row.revenue),
          percentage: 0, // Will be calculated
        })),
        room_type_performance: roomTypeRows.map((row) => ({
          room_type: row.type_name,
          booking_count: parseInt(row.booking_count),
          revenue: parseFloat(row.revenue),
          avg_booking_value: parseFloat(row.avg_booking_value),
        })),
      };
    } catch (error) {
      throw new Error(`Error getting booking analytics: ${error.message}`);
    }
  }

  /**
   * Get customer analytics
   */
  static async getCustomerAnalytics(start_date, end_date, segment = "all") {
    try {
      // Customer acquisition
      const [acquisitionRows] = await pool.execute(
        `
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as new_customers
        FROM customers 
        WHERE DATE(created_at) BETWEEN ? AND ?
        GROUP BY DATE(created_at)
        ORDER BY date
      `,
        [
          start_date.toISOString().split("T")[0],
          end_date.toISOString().split("T")[0],
        ]
      );

      // Customer lifetime value
      const [clvRows] = await pool.execute(
        `
        SELECT 
          c.customer_id,
          c.full_name,
          COUNT(b.booking_id) as total_bookings,
          SUM(b.total_amount) as total_spent,
          AVG(b.total_amount) as avg_booking_value,
          MIN(b.created_at) as first_booking,
          MAX(b.created_at) as last_booking
        FROM customers c
        LEFT JOIN bookings b ON c.customer_id = b.customer_id 
          AND b.booking_status IN ('confirmed', 'checked_in', 'checked_out', 'completed')
        WHERE DATE(c.created_at) BETWEEN ? AND ?
        GROUP BY c.customer_id, c.full_name
        ORDER BY total_spent DESC
        LIMIT 100
      `,
        [
          start_date.toISOString().split("T")[0],
          end_date.toISOString().split("T")[0],
        ]
      );

      // Customer segments
      const [segmentRows] = await pool.execute(
        `
        SELECT 
          CASE 
            WHEN booking_count = 0 THEN 'New'
            WHEN booking_count = 1 THEN 'One-time'
            WHEN booking_count BETWEEN 2 AND 5 THEN 'Regular'
            ELSE 'VIP'
          END as segment,
          COUNT(*) as customer_count,
          AVG(total_spent) as avg_spent
        FROM (
          SELECT 
            c.customer_id,
            COUNT(b.booking_id) as booking_count,
            SUM(b.total_amount) as total_spent
          FROM customers c
          LEFT JOIN bookings b ON c.customer_id = b.customer_id
            AND b.booking_status IN ('confirmed', 'checked_in', 'checked_out', 'completed')
          WHERE DATE(c.created_at) BETWEEN ? AND ?
          GROUP BY c.customer_id
        ) customer_stats
        GROUP BY segment
        ORDER BY avg_spent DESC
      `,
        [
          start_date.toISOString().split("T")[0],
          end_date.toISOString().split("T")[0],
        ]
      );

      return {
        period: {
          start_date: start_date.toISOString().split("T")[0],
          end_date: end_date.toISOString().split("T")[0],
        },
        segment,
        acquisition_trend: acquisitionRows.map((row) => ({
          date: row.date,
          new_customers: parseInt(row.new_customers),
        })),
        top_customers: clvRows.map((row) => ({
          customer_id: row.customer_id,
          name: row.full_name,
          total_bookings: parseInt(row.total_bookings || 0),
          total_spent: parseFloat(row.total_spent || 0),
          avg_booking_value: parseFloat(row.avg_booking_value || 0),
          first_booking: row.first_booking,
          last_booking: row.last_booking,
        })),
        customer_segments: segmentRows.map((row) => ({
          segment: row.segment,
          customer_count: parseInt(row.customer_count),
          avg_spent: parseFloat(row.avg_spent || 0),
        })),
      };
    } catch (error) {
      throw new Error(`Error getting customer analytics: ${error.message}`);
    }
  }

  /**
   * Get performance metrics
   */
  static async getPerformanceMetrics(timeframe = "30d") {
    try {
      const dateFilter = this.getDateFilterFromTimeframe(timeframe);

      // Key performance indicators
      const [kpiRows] = await pool.execute(`
        SELECT 
          COUNT(DISTINCT b.customer_id) as unique_customers,
          COUNT(b.booking_id) as total_bookings,
          SUM(b.total_amount) as total_revenue,
          AVG(b.total_amount) as avg_booking_value,
          AVG(DATEDIFF(b.check_out_date, b.check_in_date)) as avg_stay_duration,
          AVG(r.rating) as avg_rating
        FROM bookings b
        LEFT JOIN reviews r ON b.booking_id = r.booking_id AND r.review_status = 'approved'
        WHERE ${dateFilter.replace("created_at", "b.created_at")}
          AND b.booking_status IN ('confirmed', 'checked_in', 'checked_out', 'completed')
      `);

      // Conversion metrics
      const [conversionRows] = await pool.execute(`
        SELECT 
          COUNT(CASE WHEN booking_status = 'confirmed' THEN 1 END) as confirmed_bookings,
          COUNT(CASE WHEN booking_status = 'cancelled' THEN 1 END) as cancelled_bookings,
          COUNT(*) as total_attempts
        FROM bookings
        WHERE ${dateFilter}
      `);

      // Revenue per available room (RevPAR)
      const occupancyData = await this.getOccupancyRate(
        this.getDateFromTimeframe(timeframe),
        new Date(),
        null,
        "total"
      );

      const revpar =
        occupancyData.total_room_nights > 0
          ? parseFloat(kpiRows[0].total_revenue || 0) /
            occupancyData.total_room_nights
          : 0;

      const conversionRate =
        conversionRows[0].total_attempts > 0
          ? (conversionRows[0].confirmed_bookings /
              conversionRows[0].total_attempts) *
            100
          : 0;

      return {
        timeframe,
        kpis: {
          unique_customers: parseInt(kpiRows[0].unique_customers || 0),
          total_bookings: parseInt(kpiRows[0].total_bookings || 0),
          total_revenue: parseFloat(kpiRows[0].total_revenue || 0),
          avg_booking_value: parseFloat(kpiRows[0].avg_booking_value || 0),
          avg_stay_duration: parseFloat(kpiRows[0].avg_stay_duration || 0),
          avg_rating: parseFloat(kpiRows[0].avg_rating || 0),
          occupancy_rate: occupancyData.occupancy_rate,
          revpar: revpar,
          conversion_rate: conversionRate,
        },
        performance_indicators: {
          revenue_growth: 0, // Would need previous period comparison
          occupancy_trend: 0, // Would need previous period comparison
          customer_satisfaction: parseFloat(kpiRows[0].avg_rating || 0),
          booking_conversion: conversionRate,
        },
      };
    } catch (error) {
      throw new Error(`Error getting performance metrics: ${error.message}`);
    }
  }

  /**
   * Get forecast data (simplified prediction)
   */
  static async getForecastData(
    type = "occupancy",
    period = "30d",
    room_type_id = null
  ) {
    try {
      // This is a simplified forecasting implementation
      // In a real application, you would use more sophisticated algorithms

      const historicalPeriod = this.getDateFromTimeframe(period);
      const forecastStart = new Date();
      const forecastEnd = new Date();
      forecastEnd.setDate(forecastEnd.getDate() + 30); // 30 days forecast

      if (type === "occupancy") {
        // Get historical occupancy data
        const historicalData = await this.getOccupancyRate(
          historicalPeriod,
          new Date(),
          room_type_id,
          "daily"
        );

        // Simple moving average prediction
        const recentData = historicalData.daily_data.slice(-7); // Last 7 days
        const avgOccupancy =
          recentData.reduce((sum, day) => sum + day.occupancy_rate, 0) /
          recentData.length;

        const forecast = [];
        const currentDate = new Date(forecastStart);

        while (currentDate <= forecastEnd) {
          // Add some randomness and seasonal adjustment
          const dayOfWeek = currentDate.getDay();
          const weekendMultiplier =
            dayOfWeek === 0 || dayOfWeek === 6 ? 1.2 : 1.0;

          const predictedOccupancy = Math.min(
            100,
            Math.max(
              0,
              avgOccupancy * weekendMultiplier * (0.9 + Math.random() * 0.2)
            )
          );

          forecast.push({
            date: currentDate.toISOString().split("T")[0],
            predicted_occupancy: Math.round(predictedOccupancy * 100) / 100,
            confidence: 75, // Simplified confidence score
          });

          currentDate.setDate(currentDate.getDate() + 1);
        }

        return {
          type,
          room_type_id,
          forecast_period: {
            start_date: forecastStart.toISOString().split("T")[0],
            end_date: forecastEnd.toISOString().split("T")[0],
          },
          historical_period: {
            start_date: historicalPeriod.toISOString().split("T")[0],
            end_date: new Date().toISOString().split("T")[0],
          },
          forecast_data: forecast,
          model_info: {
            algorithm: "Moving Average",
            accuracy: "Estimated 75%",
            last_updated: new Date().toISOString(),
          },
        };
      }

      return {
        type,
        message: "Forecast type not implemented yet",
        available_types: ["occupancy"],
      };
    } catch (error) {
      throw new Error(`Error generating forecast data: ${error.message}`);
    }
  }

  /**
   * Get comparative analytics
   */
  static async getComparativeAnalytics(
    currentStart,
    currentEnd,
    previousStart,
    previousEnd,
    metrics
  ) {
    try {
      const comparison = {};

      for (const metric of metrics) {
        switch (metric) {
          case "revenue":
            const [currentRevenue] = await pool.execute(
              `
              SELECT SUM(total_amount) as revenue, COUNT(*) as bookings
              FROM bookings 
              WHERE DATE(created_at) BETWEEN ? AND ?
                AND booking_status IN ('confirmed', 'checked_in', 'checked_out', 'completed')
            `,
              [
                currentStart.toISOString().split("T")[0],
                currentEnd.toISOString().split("T")[0],
              ]
            );

            const [previousRevenue] = await pool.execute(
              `
              SELECT SUM(total_amount) as revenue, COUNT(*) as bookings
              FROM bookings 
              WHERE DATE(created_at) BETWEEN ? AND ?
                AND booking_status IN ('confirmed', 'checked_in', 'checked_out', 'completed')
            `,
              [
                previousStart.toISOString().split("T")[0],
                previousEnd.toISOString().split("T")[0],
              ]
            );

            const currentRev = parseFloat(currentRevenue[0].revenue || 0);
            const previousRev = parseFloat(previousRevenue[0].revenue || 0);

            comparison.revenue = {
              current: currentRev,
              previous: previousRev,
              change: currentRev - previousRev,
              change_percentage:
                previousRev > 0
                  ? ((currentRev - previousRev) / previousRev) * 100
                  : 0,
            };
            break;

          case "occupancy":
            const currentOccupancy = await this.getOccupancyRate(
              currentStart,
              currentEnd,
              null,
              "total"
            );
            const previousOccupancy = await this.getOccupancyRate(
              previousStart,
              previousEnd,
              null,
              "total"
            );

            comparison.occupancy = {
              current: currentOccupancy.occupancy_rate,
              previous: previousOccupancy.occupancy_rate,
              change:
                currentOccupancy.occupancy_rate -
                previousOccupancy.occupancy_rate,
              change_percentage:
                previousOccupancy.occupancy_rate > 0
                  ? ((currentOccupancy.occupancy_rate -
                      previousOccupancy.occupancy_rate) /
                      previousOccupancy.occupancy_rate) *
                    100
                  : 0,
            };
            break;

          case "bookings":
            const [currentBookings] = await pool.execute(
              `
              SELECT COUNT(*) as bookings
              FROM bookings 
              WHERE DATE(created_at) BETWEEN ? AND ?
            `,
              [
                currentStart.toISOString().split("T")[0],
                currentEnd.toISOString().split("T")[0],
              ]
            );

            const [previousBookings] = await pool.execute(
              `
              SELECT COUNT(*) as bookings
              FROM bookings 
              WHERE DATE(created_at) BETWEEN ? AND ?
            `,
              [
                previousStart.toISOString().split("T")[0],
                previousEnd.toISOString().split("T")[0],
              ]
            );

            const currentBook = parseInt(currentBookings[0].bookings);
            const previousBook = parseInt(previousBookings[0].bookings);

            comparison.bookings = {
              current: currentBook,
              previous: previousBook,
              change: currentBook - previousBook,
              change_percentage:
                previousBook > 0
                  ? ((currentBook - previousBook) / previousBook) * 100
                  : 0,
            };
            break;
        }
      }

      return {
        current_period: {
          start_date: currentStart.toISOString().split("T")[0],
          end_date: currentEnd.toISOString().split("T")[0],
        },
        previous_period: {
          start_date: previousStart.toISOString().split("T")[0],
          end_date: previousEnd.toISOString().split("T")[0],
        },
        metrics: comparison,
      };
    } catch (error) {
      throw new Error(`Error getting comparative analytics: ${error.message}`);
    }
  }

  /**
   * Export analytics data
   */
  static async exportData(type, start_date = null, end_date = null) {
    try {
      const defaultEnd = end_date || new Date();
      const defaultStart = start_date || this.getDateFromTimeframe("30d");

      switch (type) {
        case "dashboard":
          return await this.getDashboardOverview("30d");
        case "occupancy":
          return await this.getOccupancyRate(
            defaultStart,
            defaultEnd,
            null,
            "daily"
          );
        case "revenue":
          return await this.getRevenueAnalytics(
            defaultStart,
            defaultEnd,
            "daily",
            true
          );
        case "bookings":
          return await this.getBookingAnalytics(
            defaultStart,
            defaultEnd,
            "daily"
          );
        default:
          throw new Error("Invalid export type");
      }
    } catch (error) {
      throw new Error(`Error exporting data: ${error.message}`);
    }
  }

  /**
   * Convert data to CSV format
   */
  static async convertToCSV(data, type) {
    try {
      // This is a simplified CSV conversion
      // In a real application, you would use a proper CSV library

      let csv = "";

      if (type === "occupancy" && data.daily_data) {
        csv = "Date,Total Rooms,Booked Rooms,Available Rooms,Occupancy Rate\n";
        data.daily_data.forEach((day) => {
          csv += `${day.date},${day.total_rooms},${day.booked_rooms},${day.available_rooms},${day.occupancy_rate}\n`;
        });
      } else if (type === "revenue" && data.data) {
        csv =
          "Period,Booking Revenue,Services Revenue,Total Revenue,Booking Count\n";
        data.data.forEach((item) => {
          csv += `${item.period},${item.booking_revenue},${item.services_revenue},${item.total_revenue},${item.booking_count}\n`;
        });
      } else {
        csv = "Error,Data format not supported for CSV export\n";
      }

      return csv;
    } catch (error) {
      throw new Error(`Error converting to CSV: ${error.message}`);
    }
  }

  /**
   * Get real-time metrics
   */
  static async getRealTimeMetrics() {
    try {
      const today = new Date().toISOString().split("T")[0];

      // Today's bookings
      const [todayBookings] = await pool.execute(
        `
        SELECT COUNT(*) as count, SUM(total_amount) as revenue
        FROM bookings 
        WHERE DATE(created_at) = ?
      `,
        [today]
      );

      // Current occupancy
      const [currentOccupancy] = await pool.execute(
        `
        SELECT 
          COUNT(*) as total_rooms,
          COUNT(CASE WHEN ra.status = 'booked' THEN 1 END) as booked_rooms
        FROM rooms r
        LEFT JOIN room_availability ra ON r.room_id = ra.room_id AND ra.date = ?
      `,
        [today]
      );

      // Pending check-ins/check-outs
      const [checkIns] = await pool.execute(
        `
        SELECT COUNT(*) as count
        FROM bookings 
        WHERE check_in_date = ? AND booking_status = 'confirmed'
      `,
        [today]
      );

      const [checkOuts] = await pool.execute(
        `
        SELECT COUNT(*) as count
        FROM bookings 
        WHERE check_out_date = ? AND booking_status = 'checked_in'
      `,
        [today]
      );

      const totalRooms = parseInt(currentOccupancy[0].total_rooms);
      const bookedRooms = parseInt(currentOccupancy[0].booked_rooms || 0);
      const occupancyRate =
        totalRooms > 0 ? (bookedRooms / totalRooms) * 100 : 0;

      return {
        date: today,
        bookings_today: {
          count: parseInt(todayBookings[0].count || 0),
          revenue: parseFloat(todayBookings[0].revenue || 0),
        },
        current_occupancy: {
          total_rooms: totalRooms,
          booked_rooms: bookedRooms,
          available_rooms: totalRooms - bookedRooms,
          occupancy_rate: Math.round(occupancyRate * 100) / 100,
        },
        pending_operations: {
          check_ins: parseInt(checkIns[0].count || 0),
          check_outs: parseInt(checkOuts[0].count || 0),
        },
      };
    } catch (error) {
      throw new Error(`Error getting real-time metrics: ${error.message}`);
    }
  }

  /**
   * Helper function to get date from timeframe
   */
  static getDateFromTimeframe(timeframe) {
    const date = new Date();

    switch (timeframe) {
      case "7d":
        date.setDate(date.getDate() - 7);
        break;
      case "30d":
        date.setDate(date.getDate() - 30);
        break;
      case "90d":
        date.setDate(date.getDate() - 90);
        break;
      case "1y":
        date.setFullYear(date.getFullYear() - 1);
        break;
      default:
        date.setDate(date.getDate() - 30);
    }

    return date;
  }

  /**
   * Helper function to get date filter SQL from timeframe
   */
  static getDateFilterFromTimeframe(timeframe) {
    switch (timeframe) {
      case "7d":
        return "DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
      case "30d":
        return "DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
      case "90d":
        return "DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)";
      case "1y":
        return "DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)";
      default:
        return "DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
    }
  }
}

module.exports = Analytics;
