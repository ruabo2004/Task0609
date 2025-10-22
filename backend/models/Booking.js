// Booking Model
// Will be implemented in Week 4

const { executeQuery, getConnection } = require("../config/database");

class Booking {
  constructor(bookingData) {
    this.id = bookingData.id;
    this.user_id = bookingData.user_id;
    this.room_id = bookingData.room_id;
    this.check_in_date = bookingData.check_in_date;
    this.check_out_date = bookingData.check_out_date;
    this.guests_count = bookingData.guests_count;
    this.total_amount = bookingData.total_amount;
    this.status = bookingData.status;
    this.special_requests = bookingData.special_requests;
    this.created_at = bookingData.created_at;
    this.updated_at = bookingData.updated_at;

    // Customer information (from JOIN)
    this.customer_name = bookingData.customer_name;
    this.customer_email = bookingData.customer_email;
    this.customer_phone = bookingData.customer_phone;

    // Room information (from JOIN)
    this.room_number = bookingData.room_number;
    this.room_type = bookingData.room_type;
    this.price_per_night = bookingData.price_per_night;
    this.capacity = bookingData.capacity;
  }

  // Static methods for database operations

  // @desc    Get all bookings with filters and pagination
  static async getAll(filters = {}, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      let query = `
        SELECT b.*, u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone,
               r.room_number, r.room_type, r.price_per_night, r.images
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN rooms r ON b.room_id = r.id
        WHERE 1=1
      `;
      let countQuery = `
        SELECT COUNT(*) as total
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN rooms r ON b.room_id = r.id
        WHERE 1=1
      `;
      const queryParams = [];

      // Apply filters
      if (filters.status) {
        query += " AND b.status = ?";
        countQuery += " AND b.status = ?";
        queryParams.push(filters.status);
      }

      if (filters.user_id) {
        query += " AND b.user_id = ?";
        countQuery += " AND b.user_id = ?";
        queryParams.push(filters.user_id);
      }

      if (filters.room_id) {
        query += " AND b.room_id = ?";
        countQuery += " AND b.room_id = ?";
        queryParams.push(filters.room_id);
      }

      if (filters.check_in_from) {
        query += " AND b.check_in_date >= ?";
        countQuery += " AND b.check_in_date >= ?";
        queryParams.push(filters.check_in_from);
      }

      if (filters.check_in_to) {
        query += " AND b.check_in_date <= ?";
        countQuery += " AND b.check_in_date <= ?";
        queryParams.push(filters.check_in_to);
      }

      query += ` ORDER BY b.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
      const paginationParams = queryParams;

      const [bookings, totalResult] = await Promise.all([
        executeQuery(query, paginationParams),
        executeQuery(countQuery, queryParams),
      ]);

      // Fetch services for all bookings
      const bookingIds = bookings.map((b) => b.id);
      let servicesMap = {};

      if (bookingIds.length > 0) {
        const servicesQuery = `
          SELECT bs.*, s.name as service_name
          FROM booking_services bs
          JOIN services s ON bs.service_id = s.id
          WHERE bs.booking_id IN (${bookingIds.map(() => "?").join(",")})
        `;
        const servicesResults = await executeQuery(servicesQuery, bookingIds);

        // Group services by booking_id
        servicesResults.forEach((service) => {
          if (!servicesMap[service.booking_id]) {
            servicesMap[service.booking_id] = [];
          }
          servicesMap[service.booking_id].push({
            id: service.id,
            service_id: service.service_id,
            name: service.service_name,
            unit_price: service.unit_price,
            quantity: service.quantity,
            total_price: service.total_price,
            total_amount: service.total_price,
            created_at: service.created_at,
          });
        });
      }

      return {
        bookings: bookings.map((booking) => {
          // Create booking instance and add joined data
          const bookingInstance = new Booking(booking);
          bookingInstance.customer_name = booking.customer_name;
          bookingInstance.customer_email = booking.customer_email;
          bookingInstance.room_number = booking.room_number;
          bookingInstance.room_type = booking.room_type;
          bookingInstance.price_per_night = booking.price_per_night;
          bookingInstance.services = servicesMap[booking.id] || [];
          try {
            if (booking.images) {
              bookingInstance.room_images =
                typeof booking.images === "string"
                  ? JSON.parse(booking.images)
                  : booking.images;
            }
          } catch (parseError) {
            bookingInstance.room_images = [];
          }
          return bookingInstance;
        }),
        total: totalResult[0].total,
        page,
        totalPages: Math.ceil(totalResult[0].total / limit),
      };
    } catch (error) {
      throw error;
    }
  }

  // @desc    Find booking by ID
  static async findById(id) {
    try {
      const query = `
        SELECT b.*, u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone,
               r.room_number, r.room_type, r.price_per_night, r.capacity
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN rooms r ON b.room_id = r.id
        WHERE b.id = ?
      `;
      const results = await executeQuery(query, [id]);
      return results.length > 0 ? new Booking(results[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // @desc    Get bookings by user ID
  static async findByUserId(userId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const query = `
        SELECT b.*, r.room_number, r.room_type, r.price_per_night
        FROM bookings b
        JOIN rooms r ON b.room_id = r.id
        WHERE b.user_id = ?
        ORDER BY b.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      const countQuery =
        "SELECT COUNT(*) as total FROM bookings WHERE user_id = ?";

      const [bookings, totalResult] = await Promise.all([
        executeQuery(query, [userId]),
        executeQuery(countQuery, [userId]),
      ]);

      return {
        bookings: bookings.map((booking) => ({
          id: booking.id,
          user_id: booking.user_id,
          room_id: booking.room_id,
          check_in_date: booking.check_in_date,
          check_out_date: booking.check_out_date,
          guests_count: booking.guests_count,
          total_amount: booking.total_amount,
          status: booking.status,
          special_requests: booking.special_requests,
          created_at: booking.created_at,
          updated_at: booking.updated_at,
          room_number: booking.room_number,
          room_type: booking.room_type,
          price_per_night: booking.price_per_night,
          room_images: [],
        })),
        total: totalResult[0].total,
        page,
        totalPages: Math.ceil(totalResult[0].total / limit),
      };
    } catch (error) {
      throw error;
    }
  }

  // @desc    Create new booking
  static async create(bookingData) {
    const connection = await getConnection();

    try {
      await connection.beginTransaction();

      // Check room availability
      const availabilityQuery = `
        SELECT id FROM bookings 
        WHERE room_id = ? 
        AND status IN ('confirmed', 'checked_in')
        AND (
          (check_in_date <= ? AND check_out_date > ?) OR
          (check_in_date < ? AND check_out_date >= ?) OR
          (check_in_date >= ? AND check_out_date <= ?)
        )
      `;
      const conflictBookings = await connection.execute(availabilityQuery, [
        bookingData.room_id,
        bookingData.check_in_date,
        bookingData.check_in_date,
        bookingData.check_out_date,
        bookingData.check_out_date,
        bookingData.check_in_date,
        bookingData.check_out_date,
      ]);

      if (conflictBookings[0].length > 0) {
        throw new Error("Room is not available for the selected dates");
      }

      // Calculate total amount
      const roomQuery = "SELECT price_per_night FROM rooms WHERE id = ?";
      const roomResult = await connection.execute(roomQuery, [
        bookingData.room_id,
      ]);

      if (roomResult[0].length === 0) {
        throw new Error("Room not found");
      }

      const pricePerNight = roomResult[0][0].price_per_night;
      const checkIn = new Date(bookingData.check_in_date);
      const checkOut = new Date(bookingData.check_out_date);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      const totalAmount = pricePerNight * nights;

      // Create booking
      const insertQuery = `
        INSERT INTO bookings (user_id, room_id, check_in_date, check_out_date, guests_count, total_amount, status, special_requests)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        bookingData.user_id,
        bookingData.room_id,
        bookingData.check_in_date,
        bookingData.check_out_date,
        bookingData.guests_count,
        totalAmount,
        bookingData.status || "pending",
        bookingData.special_requests || null,
      ];

      const result = await connection.execute(insertQuery, values);
      await connection.commit();

      return await Booking.findById(result[0].insertId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // @desc    Check room availability for date range
  static async checkAvailability(
    roomId,
    checkInDate,
    checkOutDate,
    excludeBookingId = null
  ) {
    try {
      let query = `
        SELECT id, check_in_date, check_out_date FROM bookings 
        WHERE room_id = ? 
        AND status IN ('confirmed', 'checked_in')
        AND (
          (check_in_date <= ? AND check_out_date > ?) OR
          (check_in_date < ? AND check_out_date >= ?) OR
          (check_in_date >= ? AND check_out_date <= ?)
        )
      `;
      const params = [
        roomId,
        checkInDate,
        checkInDate,
        checkOutDate,
        checkOutDate,
        checkInDate,
        checkOutDate,
      ];

      if (excludeBookingId) {
        query += " AND id != ?";
        params.push(excludeBookingId);
      }

      const results = await executeQuery(query, params);

      return {
        available: results.length === 0,
        conflictingBookings: results.map((booking) => ({
          id: booking.id,
          check_in_date: booking.check_in_date,
          check_out_date: booking.check_out_date,
        })),
      };
    } catch (error) {
      throw error;
    }
  }

  // Instance methods

  // @desc    Update booking
  async update(updateData) {
    const connection = await getConnection();

    try {
      await connection.beginTransaction();

      const allowedFields = [
        "check_in_date",
        "check_out_date",
        "guests_count",
        "status",
        "special_requests",
      ];

      const updateFields = [];
      const values = [];

      // Check if dates are being updated and room is still available
      if (updateData.check_in_date || updateData.check_out_date) {
        const checkInDate = updateData.check_in_date || this.check_in_date;
        const checkOutDate = updateData.check_out_date || this.check_out_date;

        const availabilityResult = await Booking.checkAvailability(
          this.room_id,
          checkInDate,
          checkOutDate,
          this.id
        );

        if (!availabilityResult.available) {
          throw new Error("Room is not available for the updated dates");
        }

        // Recalculate total amount if dates changed
        if (updateData.check_in_date || updateData.check_out_date) {
          const roomQuery = "SELECT price_per_night FROM rooms WHERE id = ?";
          const roomResult = await connection.execute(roomQuery, [
            this.room_id,
          ]);
          const pricePerNight = roomResult[0][0].price_per_night;

          const checkIn = new Date(checkInDate);
          const checkOut = new Date(checkOutDate);
          const nights = Math.ceil(
            (checkOut - checkIn) / (1000 * 60 * 60 * 24)
          );
          const newTotalAmount = pricePerNight * nights;

          updateData.total_amount = newTotalAmount;
          allowedFields.push("total_amount");
        }
      }

      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          updateFields.push(`${field} = ?`);
          values.push(updateData[field]);
        }
      }

      if (updateFields.length === 0) {
        await connection.commit();
        return this;
      }

      values.push(this.id);
      const query = `UPDATE bookings SET ${updateFields.join(
        ", "
      )}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

      await connection.execute(query, values);
      await connection.commit();

      return await Booking.findById(this.id);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // @desc    Cancel booking
  async cancel() {
    try {
      const query =
        "UPDATE bookings SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?";
      await executeQuery(query, [this.id]);
      this.status = "cancelled";
      return this;
    } catch (error) {
      throw error;
    }
  }

  // @desc    Confirm booking
  async confirm() {
    try {
      const query =
        "UPDATE bookings SET status = 'confirmed', updated_at = CURRENT_TIMESTAMP WHERE id = ?";
      await executeQuery(query, [this.id]);
      this.status = "confirmed";
      return this;
    } catch (error) {
      throw error;
    }
  }

  // @desc    Check in
  async checkIn() {
    try {
      const query =
        "UPDATE bookings SET status = 'checked_in', updated_at = CURRENT_TIMESTAMP WHERE id = ?";
      await executeQuery(query, [this.id]);
      this.status = "checked_in";
      return this;
    } catch (error) {
      throw error;
    }
  }

  // @desc    Check out
  async checkOut() {
    try {
      const query =
        "UPDATE bookings SET status = 'checked_out', updated_at = CURRENT_TIMESTAMP WHERE id = ?";
      await executeQuery(query, [this.id]);
      this.status = "checked_out";
      return this;
    } catch (error) {
      throw error;
    }
  }

  // @desc    Get booking services
  async getServices() {
    try {
      const query = `
        SELECT bs.*, s.name, s.description, s.category, s.price
        FROM booking_services bs
        JOIN services s ON bs.service_id = s.id
        WHERE bs.booking_id = ?
      `;
      const results = await executeQuery(query, [this.id]);
      return results;
    } catch (error) {
      throw error;
    }
  }

  // @desc    Calculate total nights
  getTotalNights() {
    const checkIn = new Date(this.check_in_date);
    const checkOut = new Date(this.check_out_date);
    return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  }

  // @desc    Check if booking can be cancelled
  canBeCancelled() {
    return this.status === "pending" || this.status === "confirmed";
  }

  // @desc    Cancel booking
  async cancel() {
    try {
      const { executeQuery } = require("../config/database");

      const query = `
        UPDATE bookings 
        SET status = 'cancelled', updated_at = NOW() 
        WHERE id = ?
      `;

      await executeQuery(query, [this.id]);

      // Update local instance
      this.status = "cancelled";
      this.updated_at = new Date();

      return this;
    } catch (error) {
      throw error;
    }
  }

  // @desc    Check if booking can be modified
  canBeModified() {
    return this.status === "pending" || this.status === "confirmed";
  }

  // @desc    Get JSON representation
  toJSON() {
    return {
      id: this.id,
      booking_code: this.booking_code,
      user_id: this.user_id,
      room_id: this.room_id,
      check_in_date: this.check_in_date,
      check_out_date: this.check_out_date,
      number_of_guests: this.number_of_guests,
      guests_count: this.guests_count,
      total_amount: this.total_amount,
      status: this.status,
      payment_status: this.payment_status,
      special_requests: this.special_requests,
      created_at: this.created_at,
      updated_at: this.updated_at,
      total_nights: this.getTotalNights(),
      can_be_cancelled: this.canBeCancelled(),
      can_be_modified: this.canBeModified(),
      services: this.services || [],
      // Customer information
      customer_name: this.customer_name,
      customer_email: this.customer_email,
      customer_phone: this.customer_phone,
      // Room information
      room_number: this.room_number,
      room_type: this.room_type,
      price_per_night: this.price_per_night,
      capacity: this.capacity,
    };
  }

  // @desc    Get user booking statistics
  static async getUserStats(userId) {
    try {
      const query = `
        SELECT 
          COUNT(*) as totalBookings,
          SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as activeBookings,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedBookings,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelledBookings,
          COALESCE(SUM(CASE WHEN status IN ('confirmed', 'completed') THEN total_amount ELSE 0 END), 0) as totalSpent
        FROM bookings 
        WHERE user_id = ?
      `;

      const results = await executeQuery(query, [userId]);
      return (
        results[0] || {
          totalBookings: 0,
          activeBookings: 0,
          completedBookings: 0,
          cancelledBookings: 0,
          totalSpent: 0,
        }
      );
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Booking;
