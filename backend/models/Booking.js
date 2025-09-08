const { pool } = require('../config/database');

class Booking {
  constructor(data) {
    this.booking_id = data.booking_id;
    this.customer_id = data.customer_id;
    this.room_id = data.room_id;
    this.check_in_date = data.check_in_date;
    this.check_out_date = data.check_out_date;
    this.number_of_guests = data.number_of_guests;
    this.total_amount = data.total_amount;
    this.booking_status = data.booking_status;
    this.special_requests = data.special_requests;
    this.booking_date = data.booking_date;
    this.updated_at = data.updated_at;
  }

  static async create(bookingData) {
    const { 
      customer_id, 
      room_id, 
      check_in_date, 
      check_out_date, 
      number_of_guests, 
      total_amount, 
      special_requests,
      additional_services = []
    } = bookingData;

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const [availabilityCheck] = await connection.execute(
        `SELECT COUNT(*) as booking_count
         FROM bookings
         WHERE room_id = ? 
         AND booking_status IN ('confirmed', 'checked_in')
         AND (
           (check_in_date <= ? AND check_out_date > ?) OR
           (check_in_date < ? AND check_out_date >= ?) OR
           (check_in_date >= ? AND check_out_date <= ?)
         )`,
        [room_id, check_in_date, check_in_date, check_out_date, check_out_date, check_in_date, check_out_date]
      );

      if (availabilityCheck[0].booking_count > 0) {
        throw new Error('Room is not available for the selected dates');
      }

      const [bookingResult] = await connection.execute(
        `INSERT INTO bookings (customer_id, room_id, check_in_date, check_out_date, number_of_guests, total_amount, special_requests)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [customer_id, room_id, check_in_date, check_out_date, number_of_guests, total_amount, special_requests]
      );

      const bookingId = bookingResult.insertId;

      if (additional_services.length > 0) {
        for (const service of additional_services) {
          await connection.execute(
            `INSERT INTO booking_services (booking_id, service_id, quantity, unit_price, total_price)
             VALUES (?, ?, ?, ?, ?)`,
            [bookingId, service.service_id, service.quantity, service.unit_price, service.total_price]
          );
        }
      }

      await connection.commit();
      
      return await this.findByIdWithDetails(bookingId);
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error creating booking: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  static async findByIdWithDetails(bookingId) {
    try {
      const [rows] = await pool.execute(
        `SELECT b.*, 
                c.full_name as customer_name, c.email as customer_email, c.phone as customer_phone,
                r.room_number, rt.type_name, rt.base_price,
                p.payment_status, p.payment_method, p.payment_date
         FROM bookings b
         JOIN customers c ON b.customer_id = c.customer_id
         JOIN rooms r ON b.room_id = r.room_id
         JOIN room_types rt ON r.room_type_id = rt.room_type_id
         LEFT JOIN payments p ON b.booking_id = p.booking_id
         WHERE b.booking_id = ?`,
        [bookingId]
      );

      if (rows.length === 0) return null;

      const booking = rows[0];

      const [services] = await pool.execute(
        `SELECT bs.*, s.service_name, s.service_type
         FROM booking_services bs
         JOIN additional_services s ON bs.service_id = s.service_id
         WHERE bs.booking_id = ?`,
        [bookingId]
      );

      return {
        ...booking,
        additional_services: services
      };
    } catch (error) {
      throw new Error(`Error finding booking: ${error.message}`);
    }
  }

  static async getByCustomerId(customerId) {
    try {
      const [rows] = await pool.execute(
        `SELECT b.*, 
                r.room_number, rt.type_name, rt.base_price,
                p.payment_status, p.payment_method
         FROM bookings b
         JOIN rooms r ON b.room_id = r.room_id
         JOIN room_types rt ON r.room_type_id = rt.room_type_id
         LEFT JOIN payments p ON b.booking_id = p.booking_id
         WHERE b.customer_id = ?
         ORDER BY b.booking_date DESC`,
        [customerId]
      );

      return rows;
    } catch (error) {
      throw new Error(`Error getting customer bookings: ${error.message}`);
    }
  }

  async updateStatus(newStatus) {
    try {
      await pool.execute(
        'UPDATE bookings SET booking_status = ?, updated_at = CURRENT_TIMESTAMP WHERE booking_id = ?',
        [newStatus, this.booking_id]
      );

      this.booking_status = newStatus;
      return this;
    } catch (error) {
      throw new Error(`Error updating booking status: ${error.message}`);
    }
  }

  async cancel() {
    try {
      
      if (this.booking_status === 'checked_in' || this.booking_status === 'checked_out') {
        throw new Error('Cannot cancel booking that is already checked in or completed');
      }

      await this.updateStatus('cancelled');
      return this;
    } catch (error) {
      throw new Error(`Error cancelling booking: ${error.message}`);
    }
  }

  static async calculateTotalAmount(roomId, checkInDate, checkOutDate, numberOfGuests, additionalServices = []) {
    try {
      
      const [roomRows] = await pool.execute(
        `SELECT rt.base_price 
         FROM rooms r
         JOIN room_types rt ON r.room_type_id = rt.room_type_id
         WHERE r.room_id = ?`,
        [roomId]
      );

      if (roomRows.length === 0) {
        throw new Error('Room not found');
      }

      const basePrice = roomRows[0].base_price;
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const numberOfNights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

      let totalAmount = basePrice * numberOfNights;

      if (additionalServices.length > 0) {
        for (const service of additionalServices) {
          const [serviceRows] = await pool.execute(
            'SELECT price FROM additional_services WHERE service_id = ?',
            [service.service_id]
          );

          if (serviceRows.length > 0) {
            totalAmount += serviceRows[0].price * service.quantity;
          }
        }
      }

      return {
        base_amount: basePrice * numberOfNights,
        services_amount: totalAmount - (basePrice * numberOfNights),
        total_amount: totalAmount,
        number_of_nights: numberOfNights
      };
    } catch (error) {
      throw new Error(`Error calculating total amount: ${error.message}`);
    }
  }

  static async getUpcomingCheckIns(date = new Date()) {
    try {
      const [rows] = await pool.execute(
        `SELECT b.*, 
                c.full_name as customer_name, c.phone as customer_phone,
                r.room_number, rt.type_name
         FROM bookings b
         JOIN customers c ON b.customer_id = c.customer_id
         JOIN rooms r ON b.room_id = r.room_id
         JOIN room_types rt ON r.room_type_id = rt.room_type_id
         WHERE b.check_in_date = ? AND b.booking_status = 'confirmed'
         ORDER BY b.check_in_date ASC`,
        [date.toISOString().split('T')[0]]
      );

      return rows;
    } catch (error) {
      throw new Error(`Error getting upcoming check-ins: ${error.message}`);
    }
  }

  static async getUpcomingCheckOuts(date = new Date()) {
    try {
      const [rows] = await pool.execute(
        `SELECT b.*, 
                c.full_name as customer_name, c.phone as customer_phone,
                r.room_number, rt.type_name
         FROM bookings b
         JOIN customers c ON b.customer_id = c.customer_id
         JOIN rooms r ON b.room_id = r.room_id
         JOIN room_types rt ON r.room_type_id = rt.room_type_id
         WHERE b.check_out_date = ? AND b.booking_status = 'checked_in'
         ORDER BY b.check_out_date ASC`,
        [date.toISOString().split('T')[0]]
      );

      return rows;
    } catch (error) {
      throw new Error(`Error getting upcoming check-outs: ${error.message}`);
    }
  }
}

module.exports = Booking;
