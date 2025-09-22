const { pool } = require("../config/database");

class Room {
  constructor(data) {
    this.room_id = data.room_id;
    this.room_number = data.room_number;
    this.type_id = data.type_id;
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
         JOIN room_types rt ON r.type_id = rt.type_id
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
        [
          checkInDate,
          checkInDate,
          checkOutDate,
          checkOutDate,
          checkInDate,
          checkOutDate,
        ]
      );

      return rows.map((room) => ({
        ...room,
        images: room.images || [],
        amenities: room.amenities || [],
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
         JOIN room_types rt ON r.type_id = rt.type_id
         ORDER BY r.room_number ASC`
      );

      return rows.map((room) => ({
        ...room,
        images: room.images || [],
        amenities: room.amenities || [],
      }));
    } catch (error) {
      throw new Error(`Error getting rooms: ${error.message}`);
    }
  }

  static async findById(roomId) {
    try {
      const [rows] = await pool.execute(
        `SELECT r.*, rt.type_name, rt.base_price as base_price
         FROM rooms r
         JOIN room_types rt ON r.type_id = rt.type_id
         WHERE r.room_id = ?`,
        [roomId]
      );

      if (rows.length === 0) return null;

      const room = rows[0];
      return {
        ...room,
        images: room.images || [],
        amenities: room.amenities || [],
      };
    } catch (error) {
      throw new Error(`Error finding room by ID: ${error.message}`);
    }
  }

  static async findByIdWithDetails(roomId) {
    try {
      const [rows] = await pool.execute(
        `SELECT r.*, rt.type_name, rt.description as type_description, rt.base_price, rt.max_occupancy, rt.amenities
         FROM rooms r
         JOIN room_types rt ON r.type_id = rt.type_id
         WHERE r.room_id = ?`,
        [roomId]
      );

      if (rows.length === 0) return null;

      const room = rows[0];
      return {
        ...room,
        images: room.images || [],
        amenities: room.amenities || [],
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
         JOIN room_types rt ON r.type_id = rt.type_id
         WHERE r.type_id = ?
         ORDER BY r.room_number ASC`,
        [roomTypeId]
      );

      return rows.map((room) => ({
        ...room,
        images: room.images || [],
        amenities: room.amenities || [],
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
        [
          roomId,
          checkInDate,
          checkInDate,
          checkOutDate,
          checkOutDate,
          checkInDate,
          checkOutDate,
        ]
      );

      return rows[0].booking_count === 0;
    } catch (error) {
      throw new Error(`Error checking room availability: ${error.message}`);
    }
  }

  static async getRoomTypes() {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM room_types ORDER BY base_price ASC"
      );

      return rows.map((type) => ({
        ...type,
        amenities: type.amenities || [],
      }));
    } catch (error) {
      throw new Error(`Error getting room types: ${error.message}`);
    }
  }

  static async searchRooms(filters) {
    const {
      checkInDate,
      checkOutDate,
      minPrice,
      maxPrice,
      roomType,
      maxOccupancy,
      wifiRequired,
      balconyRequired,
      smokingAllowed,
      petAllowed,
      availableOnly,
      viewType,
      bedType,
    } = filters;

    let query = `
      SELECT r.*, rt.type_name, rt.description as type_description, rt.base_price, rt.max_occupancy, rt.amenities
      FROM rooms r
      JOIN room_types rt ON r.type_id = rt.type_id
      WHERE 1=1
    `;

    let params = [];

    // Only filter by available status if specified
    if (availableOnly) {
      query += ` AND r.status = 'available'`;
    }

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
      params.push(
        checkInDate,
        checkInDate,
        checkOutDate,
        checkOutDate,
        checkInDate,
        checkOutDate
      );
    }

    if (minPrice) {
      query += " AND rt.base_price >= ?";
      params.push(minPrice);
    }

    if (maxPrice) {
      query += " AND rt.base_price <= ?";
      params.push(maxPrice);
    }

    if (roomType) {
      query += " AND rt.type_id = ?";
      params.push(roomType);
    }

    if (maxOccupancy) {
      query += " AND rt.max_occupancy >= ?";
      params.push(maxOccupancy);
    }

    // Filter by amenities/features
    if (wifiRequired) {
      query += " AND r.wifi_available = TRUE";
    }

    if (balconyRequired) {
      query += " AND r.balcony_available = TRUE";
    }

    if (smokingAllowed) {
      query += " AND r.smoking_allowed = TRUE";
    }

    if (petAllowed) {
      query += " AND r.pet_allowed = TRUE";
    }

    if (viewType) {
      query += " AND r.view_type = ?";
      params.push(viewType);
    }

    if (bedType) {
      query += " AND r.bed_type = ?";
      params.push(bedType);
    }

    query += " ORDER BY rt.base_price ASC";

    try {
      const [rows] = await pool.execute(query, params);

      return rows.map((room) => ({
        ...room,
        images: room.images || [],
        amenities: room.amenities || [],
      }));
    } catch (error) {
      throw new Error(`Error searching rooms: ${error.message}`);
    }
  }

  static async getSimilarRooms(excludeRoomId, roomTypeId, limit = 4) {
    const query = `
      SELECT 
        r.room_id,
        r.room_number,
        r.type_id,
        rt.type_name as room_type_name,
        r.base_price,
        r.max_occupancy,
        r.room_size,
        r.bed_type,
        r.view_type,
        r.images,
        r.amenities,
        r.description,
        r.is_available,
        r.rating,
        r.total_reviews
      FROM rooms r
      JOIN room_types rt ON r.type_id = rt.type_id
      WHERE r.room_id != ? 
        AND r.type_id = ? 
        AND r.is_available = 1
        AND r.status = 'available'
      ORDER BY r.rating DESC, r.base_price ASC
      LIMIT ?
    `;

    try {
      const [rows] = await pool.execute(query, [
        excludeRoomId,
        roomTypeId,
        limit,
      ]);

      return rows.map((room) => ({
        ...room,
        images: room.images || [],
        amenities: room.amenities || [],
      }));
    } catch (error) {
      throw new Error(`Error getting similar rooms: ${error.message}`);
    }
  }
}

module.exports = Room;
