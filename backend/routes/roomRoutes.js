const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const { optionalAuth } = require("../middleware/auth");
const {
  roomValidation,
  generalValidation,
} = require("../middleware/validation");

router.get("/", roomController.getAllRooms);
router.get("/types", roomController.getRoomTypes);
router.get(
  "/available",
  roomValidation.searchRooms,
  roomController.getAvailableRooms
);
router.get("/search", roomValidation.searchRooms, roomController.searchRooms);
router.get(
  "/type/:roomTypeId",
  generalValidation.idParam,
  roomController.getRoomsByType
);
router.get(
  "/:roomId",
  generalValidation.roomIdParam,
  roomController.getRoomById
);
router.get(
  "/:roomId/availability",
  roomValidation.checkAvailability,
  roomController.checkAvailability
);
router.get(
  "/:roomId/pricing",
  roomValidation.checkAvailability,
  roomController.getRoomPricing
);
router.get(
  "/:roomId/similar",
  generalValidation.roomIdParam,
  roomController.getSimilarRooms
);

module.exports = router;
