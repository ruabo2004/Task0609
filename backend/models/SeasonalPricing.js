const { pool } = require("../config/database");

class SeasonalPricing {
  constructor(data) {
    this.season_pricing_id = data.season_pricing_id;
    this.room_type_id = data.room_type_id;
    this.season_name = data.season_name;
    this.start_date = data.start_date;
    this.end_date = data.end_date;
    this.base_price = data.base_price;
    this.weekend_multiplier = data.weekend_multiplier;
    this.holiday_multiplier = data.holiday_multiplier;
    this.min_stay_nights = data.min_stay_nights;
    this.max_stay_nights = data.max_stay_nights;
    this.advance_booking_discount = data.advance_booking_discount;
    this.last_minute_surcharge = data.last_minute_surcharge;
    this.priority = data.priority;
    this.status = data.status;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;

    // Additional fields from joins
    this.room_type_name = data.room_type_name;
    this.room_type_description = data.room_type_description;
  }

  /**
   * Create seasonal pricing rule
   */
  static async create(pricingData) {
    const {
      room_type_id,
      season_name,
      start_date,
      end_date,
      base_price,
      weekend_multiplier = 1.0,
      holiday_multiplier = 1.0,
      min_stay_nights = 1,
      max_stay_nights = null,
      advance_booking_discount = 0,
      last_minute_surcharge = 0,
      priority = 1,
      status = "active",
    } = pricingData;

    try {
      // Check for overlapping periods
      const overlapping = await this.checkOverlappingPeriods(
        room_type_id,
        start_date,
        end_date,
        priority
      );

      if (overlapping.length > 0) {
        throw new Error("Overlapping seasonal pricing periods detected");
      }

      const [result] = await pool.execute(
        `INSERT INTO seasonal_pricing 
         (room_type_id, season_name, start_date, end_date, base_price,
          weekend_multiplier, holiday_multiplier, min_stay_nights, max_stay_nights,
          advance_booking_discount, last_minute_surcharge, priority, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          room_type_id,
          season_name,
          start_date,
          end_date,
          base_price,
          weekend_multiplier,
          holiday_multiplier,
          min_stay_nights,
          max_stay_nights,
          advance_booking_discount,
          last_minute_surcharge,
          priority,
          status,
        ]
      );

      return await this.findById(result.insertId);
    } catch (error) {
      throw new Error(`Error creating seasonal pricing: ${error.message}`);
    }
  }

  /**
   * Find seasonal pricing by ID
   */
  static async findById(season_pricing_id) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM seasonal_pricing WHERE season_pricing_id = ?",
        [season_pricing_id]
      );

      return rows.length > 0 ? new SeasonalPricing(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error finding seasonal pricing: ${error.message}`);
    }
  }

  /**
   * Find seasonal pricing by ID with room type details
   */
  static async findByIdWithDetails(season_pricing_id) {
    try {
      const [rows] = await pool.execute(
        `SELECT sp.*, rt.type_name as room_type_name, rt.description as room_type_description
         FROM seasonal_pricing sp
         JOIN room_types rt ON sp.room_type_id = rt.room_type_id
         WHERE sp.season_pricing_id = ?`,
        [season_pricing_id]
      );

      return rows.length > 0 ? new SeasonalPricing(rows[0]) : null;
    } catch (error) {
      throw new Error(
        `Error finding seasonal pricing with details: ${error.message}`
      );
    }
  }

  /**
   * Get all seasonal pricing with filters
   */
  static async getAllWithFilters(filters = {}) {
    try {
      const {
        room_type_id,
        status = "active",
        year,
        page = 1,
        limit = 20,
        sortBy = "start_date",
        sortOrder = "asc",
      } = filters;

      let query = `
        SELECT sp.*, rt.type_name as room_type_name, rt.description as room_type_description
        FROM seasonal_pricing sp
        JOIN room_types rt ON sp.room_type_id = rt.room_type_id
        WHERE 1=1
      `;
      const queryParams = [];

      if (room_type_id) {
        query += " AND sp.room_type_id = ?";
        queryParams.push(room_type_id);
      }

      if (status) {
        query += " AND sp.status = ?";
        queryParams.push(status);
      }

      if (year) {
        query += " AND (YEAR(sp.start_date) = ? OR YEAR(sp.end_date) = ?)";
        queryParams.push(year, year);
      }

      // Add sorting
      const validSortFields = [
        "start_date",
        "end_date",
        "season_name",
        "base_price",
        "priority",
      ];
      const sortField = validSortFields.includes(sortBy)
        ? sortBy
        : "start_date";
      const sortDirection = sortOrder.toLowerCase() === "desc" ? "DESC" : "ASC";
      query += ` ORDER BY sp.${sortField} ${sortDirection}`;

      // Add pagination
      const offset = (page - 1) * limit;
      query += " LIMIT ? OFFSET ?";
      queryParams.push(limit, offset);

      const [rows] = await pool.execute(query, queryParams);

      // Get total count
      let countQuery = `
        SELECT COUNT(*) as total 
        FROM seasonal_pricing sp 
        WHERE 1=1
      `;
      const countParams = [];

      if (room_type_id) {
        countQuery += " AND sp.room_type_id = ?";
        countParams.push(room_type_id);
      }

      if (status) {
        countQuery += " AND sp.status = ?";
        countParams.push(status);
      }

      if (year) {
        countQuery += " AND (YEAR(sp.start_date) = ? OR YEAR(sp.end_date) = ?)";
        countParams.push(year, year);
      }

      const [countRows] = await pool.execute(countQuery, countParams);
      const total = countRows[0].total;

      const pricingRules = rows.map((row) => new SeasonalPricing(row));

      return {
        pricing_rules: pricingRules,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(`Error getting seasonal pricing: ${error.message}`);
    }
  }

  /**
   * Update seasonal pricing
   */
  static async update(season_pricing_id, updateData) {
    try {
      const fieldsToUpdate = [];
      const values = [];

      const updatableFields = [
        "season_name",
        "start_date",
        "end_date",
        "base_price",
        "weekend_multiplier",
        "holiday_multiplier",
        "min_stay_nights",
        "max_stay_nights",
        "advance_booking_discount",
        "last_minute_surcharge",
        "priority",
        "status",
      ];

      updatableFields.forEach((field) => {
        if (updateData[field] !== undefined) {
          fieldsToUpdate.push(`${field} = ?`);
          values.push(updateData[field]);
        }
      });

      if (fieldsToUpdate.length === 0) {
        throw new Error("No valid fields to update");
      }

      // Check for overlapping periods if dates are being updated
      if (updateData.start_date || updateData.end_date) {
        const current = await this.findById(season_pricing_id);
        const startDate = updateData.start_date || current.start_date;
        const endDate = updateData.end_date || current.end_date;

        const overlapping = await this.checkOverlappingPeriods(
          current.room_type_id,
          startDate,
          endDate,
          updateData.priority || current.priority,
          season_pricing_id
        );

        if (overlapping.length > 0) {
          throw new Error("Overlapping seasonal pricing periods detected");
        }
      }

      values.push(season_pricing_id);

      await pool.execute(
        `UPDATE seasonal_pricing SET ${fieldsToUpdate.join(
          ", "
        )}, updated_at = CURRENT_TIMESTAMP WHERE season_pricing_id = ?`,
        values
      );

      return await this.findById(season_pricing_id);
    } catch (error) {
      throw new Error(`Error updating seasonal pricing: ${error.message}`);
    }
  }

  /**
   * Delete seasonal pricing
   */
  static async delete(season_pricing_id) {
    try {
      await pool.execute(
        "DELETE FROM seasonal_pricing WHERE season_pricing_id = ?",
        [season_pricing_id]
      );
      return true;
    } catch (error) {
      throw new Error(`Error deleting seasonal pricing: ${error.message}`);
    }
  }

  /**
   * Check for overlapping periods
   */
  static async checkOverlappingPeriods(
    room_type_id,
    start_date,
    end_date,
    priority,
    excludeId = null
  ) {
    try {
      let query = `
        SELECT * FROM seasonal_pricing 
        WHERE room_type_id = ? 
          AND status = 'active'
          AND priority = ?
          AND (
            (start_date <= ? AND end_date >= ?) OR
            (start_date <= ? AND end_date >= ?) OR
            (start_date >= ? AND end_date <= ?)
          )
      `;
      const params = [
        room_type_id,
        priority,
        start_date,
        start_date,
        end_date,
        end_date,
        start_date,
        end_date,
      ];

      if (excludeId) {
        query += " AND season_pricing_id != ?";
        params.push(excludeId);
      }

      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error checking overlapping periods: ${error.message}`);
    }
  }

  /**
   * Get pricing for a date range
   */
  static async getPricingForDateRange(
    room_type_id,
    check_in_date,
    check_out_date
  ) {
    try {
      // Get all applicable pricing rules for the date range
      const [rows] = await pool.execute(
        `SELECT * FROM seasonal_pricing 
         WHERE room_type_id = ? 
           AND status = 'active'
           AND start_date <= ? 
           AND end_date >= ?
         ORDER BY priority DESC, start_date ASC`,
        [room_type_id, check_out_date, check_in_date]
      );

      if (rows.length === 0) {
        // Get base price from room type
        const [roomTypeRows] = await pool.execute(
          "SELECT base_price FROM room_types WHERE room_type_id = ?",
          [room_type_id]
        );

        const basePrice = roomTypeRows[0]?.base_price || 0;

        return {
          room_type_id,
          check_in_date,
          check_out_date,
          total_nights: this.calculateNights(check_in_date, check_out_date),
          daily_prices: [],
          total_amount:
            basePrice * this.calculateNights(check_in_date, check_out_date),
          base_price: basePrice,
          applied_rules: [],
        };
      }

      // Calculate daily prices
      const dailyPrices = [];
      const appliedRules = [];
      let totalAmount = 0;

      const currentDate = new Date(check_in_date);
      const endDate = new Date(check_out_date);

      while (currentDate < endDate) {
        const dateStr = currentDate.toISOString().split("T")[0];

        // Find applicable pricing rule for this date
        const applicableRule = rows.find(
          (rule) => dateStr >= rule.start_date && dateStr <= rule.end_date
        );

        let dailyPrice = 0;
        let appliedRule = null;

        if (applicableRule) {
          dailyPrice = parseFloat(applicableRule.base_price);

          // Apply weekend multiplier if weekend
          const dayOfWeek = currentDate.getDay();
          if (dayOfWeek === 0 || dayOfWeek === 6) {
            // Sunday or Saturday
            dailyPrice *= parseFloat(applicableRule.weekend_multiplier);
          }

          // Check if it's a holiday (simplified - you can enhance this)
          const isHoliday = await this.isHoliday(dateStr);
          if (isHoliday) {
            dailyPrice *= parseFloat(applicableRule.holiday_multiplier);
          }

          appliedRule = applicableRule;

          // Add to applied rules if not already added
          if (
            !appliedRules.find(
              (r) => r.season_pricing_id === applicableRule.season_pricing_id
            )
          ) {
            appliedRules.push(applicableRule);
          }
        } else {
          // Use base price from room type
          const [roomTypeRows] = await pool.execute(
            "SELECT base_price FROM room_types WHERE room_type_id = ?",
            [room_type_id]
          );
          dailyPrice = parseFloat(roomTypeRows[0]?.base_price || 0);
        }

        dailyPrices.push({
          date: dateStr,
          price: dailyPrice,
          is_weekend: currentDate.getDay() === 0 || currentDate.getDay() === 6,
          applied_rule: appliedRule
            ? {
                season_pricing_id: appliedRule.season_pricing_id,
                season_name: appliedRule.season_name,
              }
            : null,
        });

        totalAmount += dailyPrice;
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return {
        room_type_id,
        check_in_date,
        check_out_date,
        total_nights: this.calculateNights(check_in_date, check_out_date),
        daily_prices: dailyPrices,
        total_amount: totalAmount,
        applied_rules: appliedRules.map((rule) => new SeasonalPricing(rule)),
      };
    } catch (error) {
      throw new Error(`Error getting pricing for date range: ${error.message}`);
    }
  }

  /**
   * Get pricing calendar for a room type
   */
  static async getPricingCalendar(room_type_id, start_date, end_date) {
    try {
      const calendar = [];
      const currentDate = new Date(start_date);
      const finalDate = new Date(end_date);

      while (currentDate <= finalDate) {
        const dateStr = currentDate.toISOString().split("T")[0];

        // Get pricing for single day
        const nextDay = new Date(currentDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const pricing = await this.getPricingForDateRange(
          room_type_id,
          dateStr,
          nextDay.toISOString().split("T")[0]
        );

        calendar.push({
          date: dateStr,
          price: pricing.daily_prices[0]?.price || 0,
          is_weekend: currentDate.getDay() === 0 || currentDate.getDay() === 6,
          season_name: pricing.applied_rules[0]?.season_name || "Base Rate",
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return calendar;
    } catch (error) {
      throw new Error(`Error getting pricing calendar: ${error.message}`);
    }
  }

  /**
   * Get seasonal pricing statistics
   */
  static async getStatistics(year) {
    try {
      // Get pricing rules count by status
      const [statusStats] = await pool.execute(
        `
        SELECT 
          status,
          COUNT(*) as count
        FROM seasonal_pricing 
        WHERE YEAR(start_date) = ? OR YEAR(end_date) = ?
        GROUP BY status
      `,
        [year, year]
      );

      // Get pricing rules by room type
      const [roomTypeStats] = await pool.execute(
        `
        SELECT 
          rt.type_name,
          COUNT(sp.season_pricing_id) as pricing_rules_count,
          AVG(sp.base_price) as avg_base_price,
          MIN(sp.base_price) as min_price,
          MAX(sp.base_price) as max_price
        FROM room_types rt
        LEFT JOIN seasonal_pricing sp ON rt.room_type_id = sp.room_type_id 
          AND (YEAR(sp.start_date) = ? OR YEAR(sp.end_date) = ?)
          AND sp.status = 'active'
        GROUP BY rt.room_type_id, rt.type_name
        ORDER BY pricing_rules_count DESC
      `,
        [year, year]
      );

      // Get seasonal trends
      const [seasonalTrends] = await pool.execute(
        `
        SELECT 
          season_name,
          COUNT(*) as count,
          AVG(base_price) as avg_price,
          AVG(weekend_multiplier) as avg_weekend_multiplier,
          AVG(holiday_multiplier) as avg_holiday_multiplier
        FROM seasonal_pricing 
        WHERE (YEAR(start_date) = ? OR YEAR(end_date) = ?)
          AND status = 'active'
        GROUP BY season_name
        ORDER BY avg_price DESC
      `,
        [year, year]
      );

      return {
        year,
        status_breakdown: statusStats,
        room_type_breakdown: roomTypeStats,
        seasonal_trends: seasonalTrends,
      };
    } catch (error) {
      throw new Error(`Error getting pricing statistics: ${error.message}`);
    }
  }

  /**
   * Bulk create from template
   */
  static async bulkCreateFromTemplate(template_name, year, room_type_ids) {
    try {
      const template = this.getPredefinedTemplate(template_name);
      if (!template) {
        throw new Error("Template not found");
      }

      const createdRules = [];

      for (const room_type_id of room_type_ids) {
        for (const season of template.seasons) {
          const pricingData = {
            room_type_id,
            season_name: season.name,
            start_date: `${year}-${season.start_date}`,
            end_date: `${year}-${season.end_date}`,
            base_price: season.base_price,
            weekend_multiplier: season.weekend_multiplier,
            holiday_multiplier: season.holiday_multiplier,
            min_stay_nights: season.min_stay_nights,
            priority: season.priority,
          };

          try {
            const rule = await this.create(pricingData);
            createdRules.push(rule);
          } catch (error) {
            console.warn(
              `Failed to create rule for room type ${room_type_id}, season ${season.name}: ${error.message}`
            );
          }
        }
      }

      return {
        template_name,
        year,
        room_type_ids,
        created_rules: createdRules,
        created_count: createdRules.length,
      };
    } catch (error) {
      throw new Error(`Error bulk creating from template: ${error.message}`);
    }
  }

  /**
   * Get available templates
   */
  static async getTemplates() {
    return [
      {
        name: "vietnam_standard",
        display_name: "Vietnam Standard Seasons",
        description: "Standard seasonal pricing for Vietnam tourism",
        seasons: [
          {
            name: "Low Season",
            start_date: "05-01",
            end_date: "09-30",
            base_price: 800000,
            weekend_multiplier: 1.2,
            holiday_multiplier: 1.5,
          },
          {
            name: "Peak Season",
            start_date: "12-15",
            end_date: "01-31",
            base_price: 1500000,
            weekend_multiplier: 1.3,
            holiday_multiplier: 2.0,
          },
          {
            name: "High Season",
            start_date: "02-01",
            end_date: "04-30",
            base_price: 1200000,
            weekend_multiplier: 1.25,
            holiday_multiplier: 1.8,
          },
        ],
      },
      {
        name: "beach_resort",
        display_name: "Beach Resort Pricing",
        description: "Optimized for beach and coastal properties",
        seasons: [
          {
            name: "Dry Season",
            start_date: "11-01",
            end_date: "04-30",
            base_price: 1800000,
            weekend_multiplier: 1.4,
            holiday_multiplier: 2.2,
          },
          {
            name: "Rainy Season",
            start_date: "05-01",
            end_date: "10-31",
            base_price: 1000000,
            weekend_multiplier: 1.15,
            holiday_multiplier: 1.6,
          },
        ],
      },
    ];
  }

  /**
   * Get predefined template
   */
  static getPredefinedTemplate(template_name) {
    const templates = this.getTemplates();
    return templates.find((t) => t.name === template_name);
  }

  /**
   * Check if a date is a holiday (simplified implementation)
   */
  static async isHoliday(date) {
    // This is a simplified implementation
    // In real application, you would check against a holidays table
    const vietnamHolidays = [
      "01-01", // New Year
      "04-30", // Reunification Day
      "05-01", // Labor Day
      "09-02", // Independence Day
    ];

    const monthDay = date.substring(5); // Get MM-DD format
    return vietnamHolidays.includes(monthDay);
  }

  /**
   * Calculate number of nights between dates
   */
  static calculateNights(check_in_date, check_out_date) {
    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  toJSON() {
    return {
      season_pricing_id: this.season_pricing_id,
      room_type_id: this.room_type_id,
      season_name: this.season_name,
      start_date: this.start_date,
      end_date: this.end_date,
      base_price: this.base_price,
      weekend_multiplier: this.weekend_multiplier,
      holiday_multiplier: this.holiday_multiplier,
      min_stay_nights: this.min_stay_nights,
      max_stay_nights: this.max_stay_nights,
      advance_booking_discount: this.advance_booking_discount,
      last_minute_surcharge: this.last_minute_surcharge,
      priority: this.priority,
      status: this.status,
      created_at: this.created_at,
      updated_at: this.updated_at,
      // Additional fields from joins
      room_type_name: this.room_type_name,
      room_type_description: this.room_type_description,
    };
  }
}

module.exports = SeasonalPricing;
