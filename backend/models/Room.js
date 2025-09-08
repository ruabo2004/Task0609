const { pool } = require('../config/database');

class Room {
  constructor(data) {
    this.room_id = data.room_id;
    this.room_number = data.room_number;
    this.room_type_id = data.room_type_id;
    this.status = data.status;
    this.floor_number = data.floor_number;
    this.description = data.description;
    this.images = data.images;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async getAvailableRooms(checkInDate, checkOutDate) {
    try {
      const [rows] = await pool.execute(
        `SELECT r.*, rt.type_name, rt.description as type_description, rt.base_price, rt.max_occupancy, rt.amenities
         FROM rooms r
         JOIN room_types rt ON r.room_type_id = rt.room_type_id
         WHERE r.status = 'available'
         AND r.room_id NOT IN (
           SELECT DISTINCT b.room_id 
           FROM bookings b 
           WHERE b.booking_status IN ('confirmed', 'checked_in')
           AND (
             (b.check_in_date <= ? AND b.check_out_date > ?) OR
             (b.check_in_date < ? AND b.check_out_date >= ?) OR
             (b.check_in_date >= ? AND b.check_out_date <= ?)
           )
         )
         ORDER BY rt.base_price ASC`,
        [checkInDate, checkInDate, checkOutDate, checkOutDate, checkInDate, checkOutDate]
      );
      
      return rows.map(room => ({
        ...room,
        images: room.images ? JSON.parse(room.images) : [],
        amenities: room.amenities ? JSON.parse(room.amenities) : []
      }));
    } catch (error) {
      throw new Error(`Error getting available rooms: ${error.message}`);
    }
  }

  static async getAllRoomsWithDetails() {
    try {
      const [rows] = await pool.execute(
        `SELECT r.*, rt.type_name, rt.description as type_description, rt.base_price, rt.max_occupancy, rt.amenities
         FROM rooms r
         JOIN room_types rt ON r.room_type_id = rt.room_type_id
         ORDER BY r.room_number ASC`
      );
      
      return rows.map(room => ({
        ...room,
        images: room.images ? JSON.parse(room.images) : [],
        amenities: room.amenities ? JSON.parse(room.amenities) : []
      }));
    } catch (error) {
      throw new Error(`Error getting rooms: ${error.message}`);
    }
  }

  static async findByIdWithDetails(roomId) {
    try {
      const [rows] = await pool.execute(
        `SELECT r.*, rt.type_name, rt.description as type_description, rt.base_price, rt.max_occupancy, rt.amenities
         FROM rooms r
         JOIN room_types rt ON r.room_type_id = rt.room_type_id
         WHERE r.room_id = ?`,
        [roomId]
      );
      
      if (rows.length === 0) return null;
      
      const room = rows[0];
      return {
        ...room,
        images: room.images ? JSON.parse(room.images) : [],
        amenities: room.amenities ? JSON.parse(room.amenities) : []
      };
    } catch (error) {
      throw new Error(`Error finding room: ${error.message}`);
    }
  }

  static async getRoomsByType(roomTypeId) {
    try {
      const [rows] = await pool.execute(
        `SELECT r.*, rt.type_name, rt.description as type_description, rt.base_price, rt.max_occupancy, rt.amenities
         FROM rooms r
         JOIN room_types rt ON r.room_type_id = rt.room_type_id
         WHERE r.room_type_id = ?
         ORDER BY r.room_number ASC`,
        [roomTypeId]
      );
      
      return rows.map(room => ({
        ...room,
        images: room.images ? JSON.parse(room.images) : [],
        amenities: room.amenities ? JSON.parse(room.amenities) : []
      }));
    } catch (error) {
      throw new Error(`Error getting rooms by type: ${error.message}`);
    }
  }

  static async checkAvailability(roomId, checkInDate, checkOutDate) {
    try {
      const [rows] = await pool.execute(
        `SELECT COUNT(*) as booking_count
         FROM bookings
         WHERE room_id = ? 
         AND booking_status IN ('confirmed', 'checked_in')
         AND (
           (check_in_date <= ? AND check_out_date > ?) OR
           (check_in_date < ? AND check_out_date >= ?) OR
           (check_in_date >= ? AND check_out_date <= ?)
         )`,
        [roomId, checkInDate, checkInDate, checkOutDate, checkOutDate, checkInDate, checkOutDate]
      );
      
      return rows[0].booking_count === 0;
    } catch (error) {
      throw new Error(`Error checking room availability: ${error.message}`);
    }
  }

  static async getRoomTypes() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM room_types ORDER BY base_price ASC'
      );
      
      return rows.map(type => ({
        ...type,
        amenities: type.amenities ? JSON.parse(type.amenities) : []
      }));
    } catch (error) {
      throw new Error(`Error getting room types: ${error.message}`);
    }
  }

  static async searchRooms(filters) {
    const { checkInDate, checkOutDate, minPrice, maxPrice, roomType, maxOccupancy } = filters;
    
    let query = `
      SELECT r.*, rt.type_name, rt.description as type_description, rt.base_price, rt.max_occupancy, rt.amenities
      FROM rooms r
      JOIN room_types rt ON r.room_type_id = rt.room_type_id
      WHERE r.status = 'available'
    `;
    
    let params = [];

    if (checkInDate && checkOutDate) {
      query += ` AND r.room_id NOT IN (
        SELECT DISTINCT b.room_id 
        FROM bookings b 
        WHERE b.booking_status IN ('confirmed', 'checked_in')
        AND (
          (b.check_in_date <= ? AND b.check_out_date > ?) OR
          (b.check_in_date < ? AND b.check_out_date >= ?) OR
          (b.check_in_date >= ? AND b.check_out_date <= ?)
        )
      )`;
      params.push(checkInDate, checkInDate, checkOutDate, checkOutDate, checkInDate, checkOutDate);
    }

    if (minPrice) {
      query += ' AND rt.base_price >= ?';
      params.push(minPrice);
    }
    
    if (maxPrice) {
      query += ' AND rt.base_price <= ?';
      params.push(maxPrice);
    }

    if (roomType) {
      query += ' AND rt.room_type_id = ?';
      params.push(roomType);
    }

    if (maxOccupancy) {
      query += ' AND rt.max_occupancy >= ?';
      params.push(maxOccupancy);
    }
    
    query += ' ORDER BY rt.base_price ASC';
    
    try {
      const [rows] = await pool.execute(query, params);
      
      return rows.map(room => ({
        ...room,
        images: room.images ? JSON.parse(room.images) : [],
        amenities: room.amenities ? JSON.parse(room.amenities) : []
      }));
    } catch (error) {
      throw new Error(`Error searching rooms: ${error.message}`);
    }
  }
}

module.exports = Room;
