/**
 * Room utility functions for frontend
 */

/**
 * Calculate room size based on capacity
 * @param {number} capacity - Number of people the room can accommodate
 * @returns {number} Room size in square meters
 */
export const calculateRoomSize = (capacity) => {
  if (!capacity || capacity <= 0) return 5.0;
  
  // Diện tích tính theo số người:
  // 1 người = 5m²
  // 2 người = 7.5m²  
  // 3 người = 10m²
  // 4 người = 12.5m²
  // 5 người = 15m²
  // 6 người = 17.5m²
  // 7+ người = 20m² + (số người - 7) * 2.5m²
  
  if (capacity === 1) return 5.0;
  if (capacity === 2) return 7.5;
  if (capacity === 3) return 10.0;
  if (capacity === 4) return 12.5;
  if (capacity === 5) return 15.0;
  if (capacity === 6) return 17.5;
  
  // Cho 7 người trở lên
  return 20.0 + (capacity - 7) * 2.5;
};

/**
 * Format room size for display
 * @param {number} capacity - Number of people the room can accommodate
 * @returns {string} Formatted room size string
 */
export const formatRoomSize = (capacity) => {
  const size = calculateRoomSize(capacity);
  return `${size} m²`;
};

/**
 * Get room size display text
 * @param {Object} room - Room object
 * @returns {string} Room size display text
 */
export const getRoomSizeDisplay = (room) => {
  // Nếu backend đã tính sẵn size, sử dụng size đó
  if (room.size !== undefined) {
    return `${room.size} m²`;
  }
  
  // Nếu không có size từ backend, tính toán từ capacity
  return formatRoomSize(room.capacity);
};

/**
 * Add calculated size to room data
 * @param {Object} room - Room object
 * @returns {Object} Room object with calculated size
 */
export const addCalculatedSize = (room) => {
  if (!room) return room;
  
  const size = room.size !== undefined ? room.size : calculateRoomSize(room.capacity);
  
  return {
    ...room,
    size: size,
    size_display: `${size} m²`
  };
};

/**
 * Add calculated size to array of rooms
 * @param {Array} rooms - Array of room objects
 * @returns {Array} Array of room objects with calculated size
 */
export const addCalculatedSizeToRooms = (rooms) => {
  if (!Array.isArray(rooms)) return rooms;
  
  return rooms.map(room => addCalculatedSize(room));
};
