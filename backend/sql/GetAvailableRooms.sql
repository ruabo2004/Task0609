-- Stored Procedure: GetAvailableRooms
-- Description: Get available rooms for a specific date range
-- Parameters: 
--   - p_check_in: Check-in date
--   - p_check_out: Check-out date  
--   - p_room_type: Room type filter (optional)

DELIMITER $$

DROP PROCEDURE IF EXISTS GetAvailableRooms$$

CREATE PROCEDURE GetAvailableRooms(
    IN p_check_in DATE,
    IN p_check_out DATE,
    IN p_room_type VARCHAR(50),
    IN p_guests INT
)
BEGIN
    SELECT 
        r.id,
        r.room_number,
        r.name,
        r.room_type,
        r.capacity,
        r.price_per_night,
        r.description,
        r.amenities,
        r.images,
        r.image_url,
        r.status,
        r.created_at,
        r.updated_at,
        -- Calculate average rating
        COALESCE(AVG(rev.rating), 0) as rating,
        COUNT(rev.id) as review_count
    FROM rooms r
    LEFT JOIN reviews rev ON r.id = rev.room_id
    WHERE r.status = 'available'
        -- Filter by room type if specified
        AND (p_room_type IS NULL OR p_room_type = '' OR r.room_type = p_room_type)
        -- Filter by capacity if specified
        AND (p_guests IS NULL OR p_guests <= 0 OR r.capacity >= p_guests)
        -- Check room is not booked during the requested period
        AND r.id NOT IN (
            SELECT DISTINCT b.room_id
            FROM bookings b
            WHERE b.status IN ('confirmed', 'checked_in')
                AND (
                    -- Booking overlaps with requested period
                    (b.check_in_date <= p_check_in AND b.check_out_date > p_check_in) OR
                    (b.check_in_date < p_check_out AND b.check_out_date >= p_check_out) OR
                    (b.check_in_date >= p_check_in AND b.check_out_date <= p_check_out)
                )
        )
    GROUP BY r.id, r.room_number, r.name, r.room_type, r.capacity, r.price_per_night, 
             r.description, r.amenities, r.images, r.image_url, r.status, r.created_at, r.updated_at
    ORDER BY r.room_number ASC;
END$$

DELIMITER ;
