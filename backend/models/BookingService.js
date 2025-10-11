// BookingService Model
// Will be implemented in Week 4

const { executeQuery, getConnection } = require("../config/database");

class BookingService {
  constructor(bookingServiceData) {
    this.id = bookingServiceData.id;
    this.booking_id = bookingServiceData.booking_id;
    this.service_id = bookingServiceData.service_id;
    // Prefer explicit service name from joined query; fall back to generic name
    this.name = bookingServiceData.service_name || bookingServiceData.name;
    this.quantity = bookingServiceData.quantity;
    this.unit_price = bookingServiceData.unit_price;
    this.total_price = bookingServiceData.total_price;
    this.price = bookingServiceData.unit_price; // Alias for backward compatibility
    this.created_at = bookingServiceData.created_at;
  }

  // Static methods for database operations

  // @desc    Get all booking services with details
  static async getAll(filters = {}) {
    try {
      let query = `
        SELECT bs.*, s.name as service_name, s.description as service_description, 
               s.category as service_category, b.user_id, u.full_name as customer_name
        FROM booking_services bs
        JOIN services s ON bs.service_id = s.id
        JOIN bookings b ON bs.booking_id = b.id
        JOIN users u ON b.user_id = u.id
        WHERE 1=1
      `;
      const queryParams = [];

      // Apply filters
      if (filters.booking_id) {
        query += " AND bs.booking_id = ?";
        queryParams.push(filters.booking_id);
      }

      if (filters.service_id) {
        query += " AND bs.service_id = ?";
        queryParams.push(filters.service_id);
      }

      if (filters.user_id) {
        query += " AND b.user_id = ?";
        queryParams.push(filters.user_id);
      }

      if (filters.service_category) {
        query += " AND s.category = ?";
        queryParams.push(filters.service_category);
      }

      query += " ORDER BY bs.created_at DESC";

      const results = await executeQuery(query, queryParams);
      return results.map(
        (bookingService) => new BookingService(bookingService)
      );
    } catch (error) {
      throw error;
    }
  }

  // @desc    Get booking services by booking ID
  static async getByBookingId(bookingId) {
    try {
      const query = `
        SELECT bs.*, s.name as service_name, s.description as service_description,
               s.category as service_category
        FROM booking_services bs
        JOIN services s ON bs.service_id = s.id
        WHERE bs.booking_id = ?
        ORDER BY s.category ASC, s.name ASC
      `;
      const results = await executeQuery(query, [bookingId]);
      return results.map(
        (bookingService) => new BookingService(bookingService)
      );
    } catch (error) {
      throw error;
    }
  }

  // @desc    Get booking services by service ID
  static async getByServiceId(serviceId) {
    try {
      const query = `
        SELECT bs.*, b.user_id, u.full_name as customer_name, 
               b.check_in_date, b.check_out_date, r.room_number
        FROM booking_services bs
        JOIN bookings b ON bs.booking_id = b.id
        JOIN users u ON b.user_id = u.id
        JOIN rooms r ON b.room_id = r.id
        WHERE bs.service_id = ?
        ORDER BY bs.created_at DESC
      `;
      const results = await executeQuery(query, [serviceId]);
      return results.map(
        (bookingService) => new BookingService(bookingService)
      );
    } catch (error) {
      throw error;
    }
  }

  // @desc    Find booking service by ID
  static async findById(id) {
    try {
      const query = `
        SELECT bs.*, s.name as service_name, s.description as service_description,
               s.category as service_category, b.user_id
        FROM booking_services bs
        JOIN services s ON bs.service_id = s.id
        JOIN bookings b ON bs.booking_id = b.id
        WHERE bs.id = ?
      `;
      const results = await executeQuery(query, [id]);
      return results.length > 0 ? new BookingService(results[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // @desc    Check if service is already added to booking
  static async findByBookingAndService(bookingId, serviceId) {
    try {
      const query =
        "SELECT * FROM booking_services WHERE booking_id = ? AND service_id = ?";
      const results = await executeQuery(query, [bookingId, serviceId]);
      return results.length > 0 ? new BookingService(results[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // @desc    Add service to booking
  static async addToBooking(bookingId, serviceId, quantity = 1) {
    const connection = await getConnection();

    try {
      await connection.beginTransaction();

      // Validate booking exists and is in valid status
      const bookingQuery = "SELECT id, status FROM bookings WHERE id = ?";
      const bookingResult = await connection.execute(bookingQuery, [bookingId]);

      if (bookingResult[0].length === 0) {
        throw new Error("Booking not found");
      }

      const booking = bookingResult[0][0];
      if (!["pending", "confirmed", "checked_in"].includes(booking.status)) {
        throw new Error("Cannot add services to this booking");
      }

      // Validate service exists and is active
      const serviceQuery =
        "SELECT id, name, price, is_active FROM services WHERE id = ?";
      const serviceResult = await connection.execute(serviceQuery, [serviceId]);

      if (serviceResult[0].length === 0) {
        throw new Error("Service not found");
      }

      const service = serviceResult[0][0];
      if (!service.is_active) {
        throw new Error("Service is not available");
      }

      // Check if service is already added to this booking
      const existingQuery =
        "SELECT id, quantity FROM booking_services WHERE booking_id = ? AND service_id = ?";
      const existingResult = await connection.execute(existingQuery, [
        bookingId,
        serviceId,
      ]);

      let bookingServiceId;

      if (existingResult[0].length > 0) {
        // Update existing service quantity
        const existingService = existingResult[0][0];
        const newQuantity = existingService.quantity + quantity;

        const updateQuery =
          "UPDATE booking_services SET quantity = ? WHERE id = ?";
        await connection.execute(updateQuery, [
          newQuantity,
          existingService.id,
        ]);

        bookingServiceId = existingService.id;
      } else {
        // Add new service to booking
        const totalPrice = service.price * quantity;
        const insertQuery = `
          INSERT INTO booking_services (booking_id, service_id, quantity, unit_price, total_price)
          VALUES (?, ?, ?, ?, ?)
        `;
        const insertResult = await connection.execute(insertQuery, [
          bookingId,
          serviceId,
          quantity,
          service.price,
          totalPrice,
        ]);

        bookingServiceId = insertResult[0].insertId;
      }

      // Update booking total amount
      await this.updateBookingTotal(connection, bookingId);

      await connection.commit();
      return await BookingService.findById(bookingServiceId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // @desc    Update booking total amount
  static async updateBookingTotal(connection, bookingId) {
    try {
      // Calculate new total including services
      const totalQuery = `
        SELECT 
          (SELECT DATEDIFF(check_out_date, check_in_date) * r.price_per_night 
           FROM bookings b 
           JOIN rooms r ON b.room_id = r.id 
           WHERE b.id = ?) +
          COALESCE(SUM(bs.total_price), 0) as new_total
        FROM booking_services bs
        WHERE bs.booking_id = ?
      `;

      const totalResult = await connection.execute(totalQuery, [
        bookingId,
        bookingId,
      ]);
      const newTotal = totalResult[0][0].new_total;

      // Update booking total
      const updateQuery = "UPDATE bookings SET total_amount = ? WHERE id = ?";
      await connection.execute(updateQuery, [newTotal, bookingId]);
    } catch (error) {
      throw error;
    }
  }

  // @desc    Get service statistics for a booking
  static async getBookingServiceStats(bookingId) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_services,
          SUM(quantity) as total_quantity,
          SUM(total_price) as total_service_amount,
          AVG(unit_price) as avg_service_price
        FROM booking_services
        WHERE booking_id = ?
      `;
      const results = await executeQuery(query, [bookingId]);
      return results[0];
    } catch (error) {
      throw error;
    }
  }

  // @desc    Get popular services statistics
  static async getPopularServicesStats(startDate = null, endDate = null) {
    try {
      let query = `
        SELECT s.id, s.name, s.category, s.price,
               COUNT(bs.id) as booking_count,
               SUM(bs.quantity) as total_quantity,
               SUM(bs.total_price) as total_revenue
        FROM services s
        LEFT JOIN booking_services bs ON s.id = bs.service_id
        LEFT JOIN bookings b ON bs.booking_id = b.id
        WHERE s.is_active = TRUE
      `;
      const params = [];

      if (startDate && endDate) {
        query += " AND DATE(bs.created_at) BETWEEN ? AND ?";
        params.push(startDate, endDate);
      }

      query += `
        GROUP BY s.id, s.name, s.category, s.price
        ORDER BY booking_count DESC, total_revenue DESC
      `;

      const results = await executeQuery(query, params);
      return results;
    } catch (error) {
      throw error;
    }
  }

  // Instance methods

  // @desc    Update service quantity
  async updateQuantity(newQuantity) {
    const connection = await getConnection();

    try {
      await connection.beginTransaction();

      if (newQuantity <= 0) {
        // Remove service if quantity is 0 or negative
        await this.remove();
        return null;
      }

      const newTotalPrice = this.unit_price * newQuantity;
      const query =
        "UPDATE booking_services SET quantity = ?, total_price = ? WHERE id = ?";
      await connection.execute(query, [newQuantity, newTotalPrice, this.id]);

      // Update booking total
      await BookingService.updateBookingTotal(connection, this.booking_id);

      await connection.commit();
      return await BookingService.findById(this.id);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // @desc    Update service price
  async updatePrice(newPrice) {
    const connection = await getConnection();

    try {
      await connection.beginTransaction();

      const newTotalPrice = newPrice * this.quantity;
      const query =
        "UPDATE booking_services SET unit_price = ?, total_price = ? WHERE id = ?";
      await connection.execute(query, [newPrice, newTotalPrice, this.id]);

      // Update booking total
      await BookingService.updateBookingTotal(connection, this.booking_id);

      await connection.commit();
      return await BookingService.findById(this.id);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // @desc    Remove service from booking
  async remove() {
    const connection = await getConnection();

    try {
      await connection.beginTransaction();

      const query = "DELETE FROM booking_services WHERE id = ?";
      await connection.execute(query, [this.id]);

      // Update booking total
      await BookingService.updateBookingTotal(connection, this.booking_id);

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // @desc    Get total amount for this service
  getTotalAmount() {
    return this.total_price || this.quantity * this.unit_price;
  }

  // @desc    Get formatted total amount
  getFormattedTotalAmount() {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(this.getTotalAmount());
  }

  // @desc    Get formatted unit price
  getFormattedPrice() {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(this.unit_price);
  }

  // @desc    Get JSON representation
  toJSON() {
    return {
      ...this,
      total_amount: this.getTotalAmount(),
      formatted_price: this.getFormattedPrice(),
      formatted_total_amount: this.getFormattedTotalAmount(),
    };
  }
}

module.exports = BookingService;
