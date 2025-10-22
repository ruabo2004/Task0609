-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: homestay_db
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `attendance_logs`
--
use homestay_db
DROP TABLE IF EXISTS `attendance_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_id` int NOT NULL,
  `shift_id` int DEFAULT NULL,
  `check_in_time` timestamp NOT NULL,
  `check_out_time` timestamp NULL DEFAULT NULL,
  `work_hours` decimal(4,2) DEFAULT NULL,
  `status` enum('on_time','late','early_leave','absent') DEFAULT 'on_time',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_staff_id` (`staff_id`),
  KEY `idx_shift_id` (`shift_id`),
  KEY `idx_check_in_time` (`check_in_time`),
  KEY `idx_status` (`status`),
  KEY `idx_staff_checkin_date` (`staff_id`,`check_in_time`),
  CONSTRAINT `attendance_logs_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `attendance_logs_ibfk_2` FOREIGN KEY (`shift_id`) REFERENCES `work_shifts` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_logs`
--

LOCK TABLES `attendance_logs` WRITE;
/*!40000 ALTER TABLE `attendance_logs` DISABLE KEYS */;
INSERT INTO `attendance_logs` VALUES (1,3,NULL,'2025-10-06 00:03:17','2025-10-06 09:03:17',9.00,'on_time','Ca lễ tân bình thường','2025-10-06 16:03:17','2025-10-06 16:03:17'),(2,4,NULL,'2025-10-05 22:03:17','2025-10-06 06:03:17',8.00,'on_time','Ca dọn dẹp sáng','2025-10-06 16:03:17','2025-10-06 16:03:17'),(3,5,NULL,'2025-10-06 00:03:17','2025-10-06 10:03:17',10.00,'on_time','Ca quản lý','2025-10-06 16:03:17','2025-10-06 16:03:17'),(4,3,NULL,'2025-10-05 00:18:17','2025-10-05 09:03:17',8.75,'late','Đến muộn 15 phút','2025-10-06 16:03:17','2025-10-06 16:03:17'),(5,4,NULL,'2025-10-04 22:03:17','2025-10-05 06:03:17',8.00,'on_time','Đúng giờ','2025-10-06 16:03:17','2025-10-06 16:03:17'),(6,5,NULL,'2025-10-05 00:03:17','2025-10-05 09:33:17',9.50,'on_time','Làm thêm giờ','2025-10-06 16:03:17','2025-10-06 16:03:17'),(7,3,NULL,'2025-10-04 00:03:17','2025-10-04 09:03:17',9.00,'on_time','Ca bình thường','2025-10-06 16:03:17','2025-10-06 16:03:17'),(8,4,NULL,'2025-10-03 22:03:17','2025-10-04 05:33:17',7.50,'early_leave','Về sớm 30 phút','2025-10-06 16:03:17','2025-10-06 16:03:17'),(9,5,NULL,'2025-10-04 00:03:17','2025-10-04 10:03:17',10.00,'on_time','Ca quản lý đầy đủ','2025-10-06 16:03:17','2025-10-06 16:03:17');
/*!40000 ALTER TABLE `attendance_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `attendance_summary`
--

DROP TABLE IF EXISTS `attendance_summary`;
/*!50001 DROP VIEW IF EXISTS `attendance_summary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `attendance_summary` AS SELECT 
 1 AS `staff_id`,
 1 AS `staff_name`,
 1 AS `department`,
 1 AS `attendance_date`,
 1 AS `check_in_time`,
 1 AS `check_out_time`,
 1 AS `work_hours`,
 1 AS `status`,
 1 AS `shift_type`,
 1 AS `attendance_status`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `booking_services`
--

DROP TABLE IF EXISTS `booking_services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `service_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_booking_service` (`booking_id`,`service_id`),
  KEY `idx_booking_id` (`booking_id`),
  KEY `idx_service_id` (`service_id`),
  CONSTRAINT `booking_services_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `booking_services_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=93 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_services`
--

LOCK TABLES `booking_services` WRITE;
/*!40000 ALTER TABLE `booking_services` DISABLE KEYS */;
/*!40000 ALTER TABLE `booking_services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `room_id` int NOT NULL,
  `check_in_date` date NOT NULL,
  `check_out_date` date NOT NULL,
  `guests_count` int NOT NULL DEFAULT '1',
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','confirmed','checked_in','checked_out','completed','cancelled') DEFAULT 'pending',
  `special_requests` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_room_id` (`room_id`),
  KEY `idx_status` (`status`),
  KEY `idx_check_dates` (`check_in_date`,`check_out_date`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=90 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (89,16,2,'2025-10-15','2025-10-31',1,7200000.00,'confirmed',NULL,'2025-10-15 14:37:46','2025-10-15 14:39:10');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contacts`
--

DROP TABLE IF EXISTS `contacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contacts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `status` enum('unread','read') DEFAULT 'unread',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contacts`
--

LOCK TABLES `contacts` WRITE;
/*!40000 ALTER TABLE `contacts` DISABLE KEYS */;
INSERT INTO `contacts` VALUES (1,'Hoàng Việt','iezreal.com@gmail.com','09886528046','Test Email từ Quần Âu Daily','okokokokokokokokokokokokokokokokokok','read','2025-10-15 14:09:41','2025-10-15 14:10:38');
/*!40000 ALTER TABLE `contacts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `customer_booking_summary`
--

DROP TABLE IF EXISTS `customer_booking_summary`;
/*!50001 DROP VIEW IF EXISTS `customer_booking_summary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `customer_booking_summary` AS SELECT 
 1 AS `user_id`,
 1 AS `full_name`,
 1 AS `email`,
 1 AS `total_bookings`,
 1 AS `total_spent`,
 1 AS `avg_rating`,
 1 AS `last_booking_date`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `daily_task_summary`
--

DROP TABLE IF EXISTS `daily_task_summary`;
/*!50001 DROP VIEW IF EXISTS `daily_task_summary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `daily_task_summary` AS SELECT 
 1 AS `task_date`,
 1 AS `staff_id`,
 1 AS `staff_name`,
 1 AS `department`,
 1 AS `total_tasks`,
 1 AS `completed_tasks`,
 1 AS `pending_tasks`,
 1 AS `in_progress_tasks`,
 1 AS `urgent_tasks`,
 1 AS `overdue_tasks`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `monthly_revenue`
--

DROP TABLE IF EXISTS `monthly_revenue`;
/*!50001 DROP VIEW IF EXISTS `monthly_revenue`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `monthly_revenue` AS SELECT 
 1 AS `year`,
 1 AS `month`,
 1 AS `total_payments`,
 1 AS `total_revenue`,
 1 AS `avg_payment_amount`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `monthly_staff_performance`
--

DROP TABLE IF EXISTS `monthly_staff_performance`;
/*!50001 DROP VIEW IF EXISTS `monthly_staff_performance`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `monthly_staff_performance` AS SELECT 
 1 AS `staff_id`,
 1 AS `full_name`,
 1 AS `department`,
 1 AS `position`,
 1 AS `year`,
 1 AS `month`,
 1 AS `total_checkins`,
 1 AS `total_checkouts`,
 1 AS `total_revenue`,
 1 AS `working_days`,
 1 AS `avg_work_hours`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('cash','card','vnpay','momo','bank_transfer','pay_later','additional_services') DEFAULT NULL,
  `payment_status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
  `transaction_id` varchar(255) DEFAULT NULL,
  `payment_date` timestamp NULL DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_booking_id` (`booking_id`),
  KEY `idx_payment_status` (`payment_status`),
  KEY `idx_payment_method` (`payment_method`),
  KEY `idx_transaction_id` (`transaction_id`),
  KEY `idx_payment_date` (`payment_date`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=102 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (101,89,7920000.00,'momo','completed','4593689700','2025-10-15 14:37:50','MoMo payment for booking #89','2025-10-15 14:37:50','2025-10-15 14:43:57');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `user_id` int NOT NULL,
  `rating` int NOT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_booking_review` (`booking_id`),
  KEY `idx_booking_id` (`booking_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_rating` (`rating`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `room_occupancy_stats`
--

DROP TABLE IF EXISTS `room_occupancy_stats`;
/*!50001 DROP VIEW IF EXISTS `room_occupancy_stats`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `room_occupancy_stats` AS SELECT 
 1 AS `id`,
 1 AS `room_number`,
 1 AS `room_type`,
 1 AS `total_bookings`,
 1 AS `successful_bookings`,
 1 AS `avg_booking_amount`,
 1 AS `last_booking_date`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `room_number` varchar(20) NOT NULL,
  `room_type` enum('single','double','suite','family') NOT NULL,
  `capacity` int NOT NULL,
  `price_per_night` decimal(10,2) NOT NULL,
  `description` text,
  `amenities` json DEFAULT NULL,
  `images` json DEFAULT NULL,
  `status` enum('available','occupied','maintenance') DEFAULT 'available',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `room_number` (`room_number`),
  KEY `idx_room_number` (`room_number`),
  KEY `idx_room_type` (`room_type`),
  KEY `idx_status` (`status`),
  KEY `idx_price` (`price_per_night`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES (1,'101','single',1,500000.00,'Đang sửa','[\"WiFi\", \"Điều hòa\", \"TV\", \"Tủ lạnh mini\", \"Ban công\"]','[\"/uploads/rooms/1---Copy--2--1760075984668-599477230.jpg\"]','available','2025-10-06 16:03:16','2025-10-15 12:51:32'),(2,'102','single',1,450000.00,'Phòng đơn cơ bản, thoáng mát','[\"WiFi\", \"Điều hòa\", \"TV\", \"Ban công\"]','[\"/uploads/rooms/1---Copy-1760075984684-282542709.jpg\", \"/uploads/rooms/1230123-1760109152358-458273619.jpg\", \"/uploads/rooms/6576756-1760109152370-239228452.jpg\"]','available','2025-10-06 16:03:16','2025-10-15 10:46:25'),(3,'201','double',2,800000.00,'Phòng đôi cao cấp với giường king size','[\"WiFi\", \"Điều hòa\", \"TV 43inch\", \"Tủ lạnh\", \"Ban công rộng\", \"Bồn tắm\"]','[\"/uploads/rooms/1-1760075984694-222991336.jpg\"]','available','2025-10-06 16:03:16','2025-10-15 14:26:17'),(4,'202','double',2,750000.00,'Phòng đôi tiêu chuẩn, view vườn','[\"WiFi\", \"Điều hòa\", \"TV\", \"Tủ lạnh mini\", \"Ban công\"]','[\"/uploads/rooms/2---Copy--2--1760075984706-629453041.jpg\"]','available','2025-10-06 16:03:16','2025-10-15 14:36:41'),(5,'203','double',2,780000.00,'Phòng đôi view hồ bơi','[\"WiFi\", \"Điều hòa\", \"TV\", \"Tủ lạnh\", \"Ban công view hồ bơi\"]','[\"/uploads/rooms/12309488091-1760109119787-216690224.jpg\", \"/uploads/rooms/12309488091-1760109108893-160702203-1760109119790-989387380.jpg\"]','available','2025-10-06 16:03:16','2025-10-13 17:59:55'),(6,'301','suite',4,1200000.00,'Suite cao cấp với phòng khách riêng','[\"WiFi\", \"Điều hòa\", \"TV 55inch\", \"Tủ lạnh lớn\", \"Phòng khách\", \"Bếp nhỏ\", \"Ban công lớn\"]','[\"/uploads/rooms/1---Copy-1760075984684-282542709.jpg\"]','available','2025-10-06 16:03:16','2025-10-15 12:55:48'),(7,'302','suite',3,1000000.00,'Suite gia đình với 2 phòng ngủ','[\"WiFi\", \"Điều hòa\", \"TV\", \"Tủ lạnh\", \"2 phòng ngủ\", \"Ban công\"]','[\"/uploads/rooms/1-1760075984694-222991336.jpg\"]','available','2025-10-06 16:03:16','2025-10-15 12:57:59'),(8,'401','family',6,1500000.00,'Phòng gia đình lớn với 3 giường','[\"WiFi\", \"Điều hòa\", \"TV lớn\", \"Tủ lạnh\", \"3 giường đôi\", \"Phòng khách\", \"Ban công rộng\"]','[\"/uploads/rooms/2---Copy--2--1760075984706-629453041.jpg\"]','available','2025-10-06 16:03:16','2025-10-10 14:52:26'),(9,'402','family',5,1300000.00,'Phòng gia đình view biển','[\"WiFi\", \"Điều hòa\", \"TV\", \"Tủ lạnh\", \"2 giường đôi + 1 giường đơn\", \"Ban công view biển\"]','[\"/uploads/rooms/1---Copy--2--1760075984668-599477230.jpg\"]','available','2025-10-06 16:03:16','2025-10-13 18:23:22'),(10,'501','suite',4,1800000.00,'Presidential Suite với jacuzzi','[\"WiFi\", \"Điều hòa\", \"TV 65inch\", \"Tủ lạnh wine\", \"Jacuzzi\", \"Phòng khách sang trọng\", \"Ban công penthouse\"]','[\"/uploads/rooms/1---Copy-1760075984684-282542709.jpg\"]','available','2025-10-06 16:03:16','2025-10-13 18:02:58'),(12,'TEST-545','suite',3,2500000.00,'Updated test room description','[\"wifi\", \"tv\", \"ac\", \"minibar\"]','[\"/uploads/rooms/2---Copy--2--1760075984706-629453041.jpg\"]','maintenance','2025-10-07 14:16:58','2025-10-15 14:19:50'),(13,'TEST-3043','suite',3,2600000.00,'Đang sửa','[\"wifi\", \"tv\", \"ac\", \"minibar\"]','[\"/uploads/rooms/902354-1760109108889-656148090.jpg\", \"/uploads/rooms/940563-1760109108891-278807624.jpg\", \"/uploads/rooms/12309488091-1760109108893-160702203.jpg\"]','available','2025-10-07 14:17:20','2025-10-10 15:15:33'),(17,'901','double',4,5000000.00,'ok','[\"WiFi\", \"giặt\"]','[\"/uploads/rooms/123-1760109093926-837777137.jpg\", \"/uploads/rooms/125-1760109093930-528220699.jpg\", \"/uploads/rooms/64534-1760109093933-239198258.jpg\"]','available','2025-10-09 17:55:54','2025-10-10 15:15:07');
/*!40000 ALTER TABLE `rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `category` enum('food','transport','entertainment','spa','other') DEFAULT 'other',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`),
  KEY `idx_category` (`category`),
  KEY `idx_active` (`is_active`),
  KEY `idx_price` (`price`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` VALUES (1,'Bữa sáng buffet','Buffet sáng đa dạng món Việt và Âu',1500000.00,'entertainment',1,'2025-10-06 16:03:16','2025-10-09 17:00:38'),(2,'Bữa trưa set menu','Set menu bữa trưa 3 món',200000.00,'food',1,'2025-10-06 16:03:16','2025-10-06 16:03:16'),(3,'Bữa tối cao cấp','Thực đơn tối cao cấp 5 món',350000.00,'food',1,'2025-10-06 16:03:16','2025-10-06 16:03:16'),(4,'Đồ uống welcome','Nước chào mừng và trái cây',50000.00,'food',1,'2025-10-06 16:03:16','2025-10-09 02:51:55'),(5,'Đưa đón sân bay','Dịch vụ đưa đón sân bay Nội Bài',500000.00,'transport',1,'2025-10-06 16:03:16','2025-10-06 16:03:16'),(6,'Thuê xe máy','Thuê xe máy theo ngày',150000.00,'transport',1,'2025-10-06 16:03:16','2025-10-06 16:03:16'),(7,'Thuê xe ô tô 4 chỗ','Thuê xe ô tô có tài xế',800000.00,'transport',1,'2025-10-06 16:03:16','2025-10-06 16:03:16'),(8,'Tour city','Tour tham quan thành phố nửa ngày',300000.00,'transport',1,'2025-10-06 16:03:16','2025-10-06 16:03:16'),(9,'Massage thư giãn','Dịch vụ massage thư giãn 60 phút',400000.00,'spa',1,'2025-10-06 16:03:16','2025-10-06 16:03:16'),(10,'Karaoke','Phòng karaoke 2 tiếng',200000.00,'entertainment',1,'2025-10-06 16:03:16','2025-10-06 16:03:16'),(11,'Hồ bơi riêng','Sử dụng hồ bơi riêng 2 tiếng',300000.00,'entertainment',1,'2025-10-06 16:03:16','2025-10-06 16:03:16'),(12,'Giặt ủi','Dịch vụ giặt ủi quần áo',100000.00,'other',1,'2025-10-06 16:03:16','2025-10-06 16:03:16'),(13,'Late checkout','Trả phòng muộn đến 15:00',200000.00,'other',1,'2025-10-06 16:03:16','2025-10-06 16:03:16'),(14,'Trang trí phòng','Trang trí phòng đặc biệt (sinh nhật, kỷ niệm)',250000.00,'other',1,'2025-10-06 16:03:16','2025-10-06 16:03:16');
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `staff_overview`
--

DROP TABLE IF EXISTS `staff_overview`;
/*!50001 DROP VIEW IF EXISTS `staff_overview`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `staff_overview` AS SELECT 
 1 AS `id`,
 1 AS `email`,
 1 AS `full_name`,
 1 AS `phone`,
 1 AS `employee_id`,
 1 AS `department`,
 1 AS `position`,
 1 AS `hire_date`,
 1 AS `salary`,
 1 AS `status`,
 1 AS `total_shifts`,
 1 AS `total_tasks`,
 1 AS `completed_tasks`,
 1 AS `avg_daily_revenue`,
 1 AS `last_check_in`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `staff_permissions`
--

DROP TABLE IF EXISTS `staff_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_id` int NOT NULL,
  `permission_type` enum('booking_management','room_management','customer_service','reports','system_admin') NOT NULL,
  `can_create` tinyint(1) DEFAULT '0',
  `can_read` tinyint(1) DEFAULT '1',
  `can_update` tinyint(1) DEFAULT '0',
  `can_delete` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_staff_permission` (`staff_id`,`permission_type`),
  KEY `idx_staff_id` (`staff_id`),
  KEY `idx_permission_type` (`permission_type`),
  CONSTRAINT `staff_permissions_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_permissions`
--

LOCK TABLES `staff_permissions` WRITE;
/*!40000 ALTER TABLE `staff_permissions` DISABLE KEYS */;
INSERT INTO `staff_permissions` VALUES (1,3,'booking_management',1,1,1,0,'2025-10-06 16:03:17','2025-10-06 16:03:17'),(2,3,'customer_service',1,1,1,0,'2025-10-06 16:03:17','2025-10-06 16:03:17'),(3,3,'reports',0,1,0,0,'2025-10-06 16:03:17','2025-10-06 16:03:17'),(4,4,'room_management',0,1,1,0,'2025-10-06 16:03:17','2025-10-06 16:03:17'),(5,4,'booking_management',0,1,0,0,'2025-10-06 16:03:17','2025-10-06 16:03:17'),(6,5,'booking_management',1,1,1,1,'2025-10-06 16:03:17','2025-10-06 16:03:17'),(7,5,'room_management',1,1,1,1,'2025-10-06 16:03:17','2025-10-06 16:03:17'),(8,5,'customer_service',1,1,1,0,'2025-10-06 16:03:17','2025-10-06 16:03:17'),(9,5,'reports',1,1,1,0,'2025-10-06 16:03:17','2025-10-06 16:03:17'),(10,5,'system_admin',0,1,0,0,'2025-10-06 16:03:17','2025-10-06 16:03:17');
/*!40000 ALTER TABLE `staff_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_profiles`
--

DROP TABLE IF EXISTS `staff_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `employee_id` varchar(20) NOT NULL,
  `department` enum('reception','housekeeping','maintenance','management') NOT NULL,
  `position` varchar(100) NOT NULL,
  `hire_date` date NOT NULL,
  `salary` decimal(10,2) DEFAULT '0.00',
  `emergency_contact_name` varchar(255) DEFAULT NULL,
  `emergency_contact_phone` varchar(20) DEFAULT NULL,
  `work_schedule` json DEFAULT NULL,
  `permissions` json DEFAULT NULL,
  `status` enum('active','inactive','on_leave') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_id` (`employee_id`),
  UNIQUE KEY `unique_user_employee` (`user_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_department` (`department`),
  KEY `idx_status` (`status`),
  KEY `idx_hire_date` (`hire_date`),
  CONSTRAINT `staff_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_profiles`
--

LOCK TABLES `staff_profiles` WRITE;
/*!40000 ALTER TABLE `staff_profiles` DISABLE KEYS */;
INSERT INTO `staff_profiles` VALUES (1,3,'EMP001','reception','Receptionist','2025-01-01',12000000.00,'Nguyễn Thị Lan','0912345678','{\"friday\": \"08:00-17:00\", \"monday\": \"08:00-17:00\", \"sunday\": \"off\", \"tuesday\": \"08:00-17:00\", \"saturday\": \"off\", \"thursday\": \"08:00-17:00\", \"wednesday\": \"08:00-17:00\"}','{\"reports\": false, \"customer_service\": true, \"booking_management\": true}','active','2025-10-06 16:03:17','2025-10-06 16:03:17'),(2,4,'EMP002','housekeeping','Housekeeping Supervisor','2025-01-01',10000000.00,'Trần Văn Minh','0923456789','{\"friday\": \"06:00-14:00\", \"monday\": \"06:00-14:00\", \"sunday\": \"off\", \"tuesday\": \"06:00-14:00\", \"saturday\": \"06:00-14:00\", \"thursday\": \"06:00-14:00\", \"wednesday\": \"06:00-14:00\"}','{\"room_management\": true, \"task_assignment\": true}','active','2025-10-06 16:03:17','2025-10-06 16:03:17'),(3,5,'EMP003','management','Assistant Manager','2025-01-01',15000000.00,'Lê Thị Hoa','0934567890','{\"friday\": \"08:00-18:00\", \"monday\": \"08:00-18:00\", \"sunday\": \"off\", \"tuesday\": \"08:00-18:00\", \"saturday\": \"08:00-14:00\", \"thursday\": \"08:00-18:00\", \"wednesday\": \"08:00-18:00\"}','{\"reports\": true, \"system_admin\": false, \"room_management\": true, \"customer_service\": true, \"booking_management\": true}','active','2025-10-06 16:03:17','2025-10-06 16:03:17');
/*!40000 ALTER TABLE `staff_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_reports`
--

DROP TABLE IF EXISTS `staff_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_id` int NOT NULL,
  `report_date` date NOT NULL,
  `checkins_count` int DEFAULT '0',
  `checkouts_count` int DEFAULT '0',
  `total_revenue` decimal(12,2) DEFAULT '0.00',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_staff_date` (`staff_id`,`report_date`),
  KEY `idx_staff_id` (`staff_id`),
  KEY `idx_report_date` (`report_date`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `staff_reports_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_reports`
--

LOCK TABLES `staff_reports` WRITE;
/*!40000 ALTER TABLE `staff_reports` DISABLE KEYS */;
INSERT INTO `staff_reports` VALUES (1,3,'2025-09-15',2,1,2400000.00,'Ngày bận rộn với nhiều khách check-in','2025-10-06 16:03:16','2025-10-06 16:03:16'),(2,4,'2025-09-15',1,0,0.00,'Hỗ trợ khách hàng và dọn dẹp phòng','2025-10-06 16:03:16','2025-10-06 16:03:16'),(3,3,'2025-09-16',0,1,3600000.00,'Khách check-out và thanh toán đầy đủ','2025-10-06 16:03:16','2025-10-06 16:03:16'),(4,4,'2025-09-16',1,0,0.00,'Đón tiếp khách mới và hướng dẫn dịch vụ','2025-10-06 16:03:16','2025-10-06 16:03:16');
/*!40000 ALTER TABLE `staff_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_tasks`
--

DROP TABLE IF EXISTS `staff_tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `assigned_to` int NOT NULL,
  `assigned_by` int DEFAULT NULL,
  `task_type` enum('cleaning','maintenance','check_in','check_out','other') NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `status` enum('pending','in_progress','completed','cancelled') DEFAULT 'pending',
  `room_id` int DEFAULT NULL,
  `booking_id` int DEFAULT NULL,
  `due_date` datetime DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_assigned_to` (`assigned_to`),
  KEY `idx_assigned_by` (`assigned_by`),
  KEY `idx_task_type` (`task_type`),
  KEY `idx_priority` (`priority`),
  KEY `idx_status` (`status`),
  KEY `idx_room_id` (`room_id`),
  KEY `idx_booking_id` (`booking_id`),
  KEY `idx_due_date` (`due_date`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_status_priority` (`status`,`priority`),
  CONSTRAINT `staff_tasks_ibfk_1` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `staff_tasks_ibfk_2` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `staff_tasks_ibfk_3` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL,
  CONSTRAINT `staff_tasks_ibfk_4` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_tasks`
--

LOCK TABLES `staff_tasks` WRITE;
/*!40000 ALTER TABLE `staff_tasks` DISABLE KEYS */;
INSERT INTO `staff_tasks` VALUES (1,3,2,'check_in','Check-in khách phòng 201','Hỗ trợ khách hàng check-in và hướng dẫn sử dụng dịch vụ','medium','pending',3,NULL,'2025-10-07 01:03:17',NULL,'2025-10-06 16:03:17','2025-10-06 16:03:17'),(2,3,2,'other','Cập nhật thông tin booking','Cập nhật thông tin các booking mới và xác nhận với khách hàng','high','in_progress',NULL,NULL,'2025-10-07 03:03:17',NULL,'2025-10-06 16:03:17','2025-10-06 16:03:17'),(3,3,2,'check_out','Check-out phòng 401','Xử lý check-out và thanh toán cho khách hàng','medium','pending',8,NULL,'2025-10-07 00:03:17',NULL,'2025-10-06 16:03:17','2025-10-06 16:03:17'),(4,3,2,'other','Xác nhận booking mới','Gọi điện xác nhận booking và thu thập thông tin khách hàng','high','pending',NULL,NULL,'2025-10-07 02:03:17',NULL,'2025-10-06 16:03:17','2025-10-06 16:03:17'),(5,4,2,'cleaning','Dọn dẹp phòng 102','Dọn dẹp và chuẩn bị phòng cho khách mới','high','pending',2,NULL,'2025-10-07 00:03:17',NULL,'2025-10-06 16:03:17','2025-10-06 16:03:17'),(6,4,2,'maintenance','Kiểm tra điều hòa phòng 301','Kiểm tra và bảo trì hệ thống điều hòa','medium','pending',6,NULL,'2025-10-07 05:03:17',NULL,'2025-10-06 16:03:17','2025-10-06 16:03:17'),(7,4,2,'cleaning','Dọn dẹp phòng 203 sau check-out','Dọn dẹp phòng sau khi khách check-out','high','completed',5,NULL,'2025-10-06 21:03:17',NULL,'2025-10-06 16:03:17','2025-10-06 16:03:17'),(8,4,5,'cleaning','Kiểm tra và dọn dẹp phòng 501','Kiểm tra tình trạng phòng Presidential Suite','medium','in_progress',10,NULL,'2025-10-07 03:03:17',NULL,'2025-10-06 16:03:17','2025-10-06 16:03:17'),(9,4,5,'maintenance','Thay bóng đèn phòng 202','Thay thế bóng đèn hỏng trong phòng','low','pending',4,NULL,'2025-10-07 07:03:17',NULL,'2025-10-06 16:03:17','2025-10-06 16:03:17'),(10,5,2,'other','Báo cáo doanh thu tuần','Tổng hợp báo cáo doanh thu và tình hình hoạt động tuần này','high','in_progress',NULL,NULL,'2025-10-07 11:03:17',NULL,'2025-10-06 16:03:17','2025-10-06 16:03:17'),(11,5,2,'other','Kiểm tra chất lượng dịch vụ','Kiểm tra và đánh giá chất lượng dịch vụ các phòng ban','medium','pending',NULL,NULL,'2025-10-07 23:03:17',NULL,'2025-10-06 16:03:17','2025-10-06 16:03:17'),(12,5,2,'other','Đào tạo nhân viên mới','Hướng dẫn quy trình làm việc cho nhân viên mới','medium','pending',NULL,NULL,'2025-10-08 23:03:17',NULL,'2025-10-06 16:03:17','2025-10-06 16:03:17'),(13,3,2,'check_in','Check-in phòng 203','Đã hoàn thành check-in cho khách hàng','medium','completed',5,NULL,'2025-10-06 20:03:17','2025-10-06 14:03:17','2025-10-06 16:03:17','2025-10-06 16:03:17'),(14,4,2,'cleaning','Dọn dẹp phòng 101','Đã hoàn thành dọn dẹp phòng','high','completed',1,NULL,'2025-10-06 19:03:17','2025-10-06 13:03:17','2025-10-06 16:03:17','2025-10-06 16:03:17'),(15,5,2,'other','Kiểm tra inventory','Đã hoàn thành kiểm tra kho','low','completed',NULL,NULL,'2025-10-06 17:03:17','2025-10-06 11:03:17','2025-10-06 16:03:17','2025-10-06 16:03:17');
/*!40000 ALTER TABLE `staff_tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `nationality` varchar(100) DEFAULT 'Vietnamese',
  `id_number` varchar(50) DEFAULT NULL,
  `address` text,
  `role` enum('customer','staff','admin') DEFAULT 'customer',
  `department` varchar(100) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_active` (`is_active`),
  KEY `idx_nationality` (`nationality`),
  KEY `idx_id_number` (`id_number`),
  KEY `idx_department` (`department`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin@homestay.com','$2a$12$F0X4WdT5nq2pnkUrj7jAZOt0lvYj85LGw.Oz8GzCkRHYZGofsP38W','Quản trị viên','0901234567','1980-01-01','Vietnamese','123456789','123 Đường Quản Trị, Quận 1, TP.HCM','admin',NULL,NULL,0,'2025-10-06 16:03:16','2025-10-10 16:40:46'),(2,'admin@gmail.com','$2a$12$F0X4WdT5nq2pnkUrj7jAZOt0lvYj85LGw.Oz8GzCkRHYZGofsP38W','Admin System','0901234566','2001-05-15','Vietnamese','98765432112121212','456 Admin Street, District 1, HCMC','admin',NULL,NULL,1,'2025-10-06 16:03:16','2025-10-15 13:36:25'),(3,'staff1@homestay.com','$2a$12$YHxhdoMsRp6mG5csHzEhV.QCzQ3zs5j61TINLRnHZ7gUxGgTrPhzO','Nguyễn Văn An','0901234568','1990-03-10','Vietnamese','123123123','789 Staff Road, Quận 3, TP.HCM789 Staff Road, Quận 3, TP.HCM789 Staff Road, Quận 3, TP.HCM789 Staff Road, Quận 3, TP.HCM789 Staff Road, Quận 3, TP.HCM789 Staff Road, Quận 3, TP.HCM','staff',NULL,NULL,1,'2025-10-06 16:03:16','2025-10-15 13:44:25'),(4,'staff2@homestay.com','$2a$12$sv04B7yi3BEbf0ME8ZmSruTYVNKONZIc8rnIAw2Mhtrt4nDcuMJr6','Trần Thị Bình','0901234569','1992-07-20','Vietnamese','444555666','321 Employee Ave, Quận 5, TP.HCM','staff',NULL,NULL,0,'2025-10-06 16:03:16','2025-10-10 06:03:01'),(5,'nhanvien@gmail.com','$2a$12$l5Qa/Dq1leq0uY5Rp7KwfOBcV6XJeZJSKhe8tIIijT3A8qfF1UTkS','Nhân Viên Chính123','0901234565','1988-12-05','Vietnamese','123123123','staff1@homestay.comstaff1@homestay.comstaff1@homestay.comstaff1@homestay.comstaff1@homestay.com','staff',NULL,NULL,1,'2025-10-06 16:03:16','2025-10-15 13:43:52'),(6,'customer1@gmail.com','$2a$12$QrewRVAdJOua9hV/W/6fgOxE6kz8oS0G71pfqmB9RNMUlcsSbHBCG','Lê Văn Cường','0901234570','1985-04-15','Vietnamese','123123123','123 Customer Lane, Quận 1, TP.HCM','customer',NULL,NULL,0,'2025-10-06 16:03:16','2025-10-10 06:03:09'),(7,'customer2@gmail.com','$2a$12$C.L1MIh4tFQks57sfW9iiOSAnlXxj7.rXXUu5zLGdGrnEDo0wzF0m','Phạm Thị Dung','0901234571','2004-08-22','Vietnamese','456456456','456 Client Street, Quận 3, TP.HCM','customer',NULL,NULL,1,'2025-10-06 16:03:16','2025-10-15 10:38:21'),(8,'customer3@gmail.com','$2a$12$Bc9tHK52NqM/oo33SScmWeVFng8Bd97PSYy2b9K4k5XP.zXajT48q','Hoàng Minh Đức','0901234572','1987-11-30','Vietnamese','789789789','789 Staff Road, Quận 3, TP.HCM789 Staff Road, Quận 3, TP.HCM789 Staff Road, Quận 3, TP.HCM','customer',NULL,NULL,1,'2025-10-06 16:03:16','2025-10-15 13:36:00'),(9,'customer4@gmail.com','$2a$12$1YyyCJad9RfJFTKAq.hjve0Zh/.dGsOQpexHX7E4ToWXRnRnNBhTC','Ngô Thị Hoa','0901234573','1993-02-14','Vietnamese','321321321','321 Visitor Ave, Quận 7, TP.HCM','customer',NULL,NULL,1,'2025-10-06 16:03:16','2025-10-07 12:54:36'),(10,'customer5@gmail.com','$2a$12$zcpicg/1lZAL3BUSkzc.ju.KWQ97aZS7z3adnhNjnPIPUK0dz6FEC','Trần Văn Nam','0901234574','1989-06-18','Vietnamese','654654654','654 Tourist Street, Quận 9, TP.HCM','customer',NULL,NULL,0,'2025-10-06 16:03:16','2025-10-10 16:50:56'),(11,'customer6@gmail.com','$2a$12$wZzZA2/5rgJF3v/Vo1eBh.q4FRjKmiKuJbccfE4zKpMo5NSo10/rC','Lý Thị Mai','0901234575','1991-09-25','Vietnamese','987987987','987 Traveler Road, Quận 10, TP.HCM','customer',NULL,NULL,1,'2025-10-06 16:03:16','2025-10-07 12:54:37'),(12,'customer7@gmail.com','$2a$12$DgUu7I4MXsks725hc.HQDehwTJLATtCo7wu9if/tAhhT53oWTcIxa','Võ Minh Tuấn','0901234576','1986-12-08','Vietnamese','147147147','147 Holiday Lane, Quận 11, TP.HCM','customer',NULL,NULL,1,'2025-10-06 16:03:16','2025-10-07 12:54:37'),(13,'customer8@gmail.com','$2a$12$KaYpIkTuZbDJUCGZyv3btuMgRSdKvV61D/X2s7KN1R1bCge/UcoKa','Đặng Thị Lan','0901234577','1994-03-12','Vietnamese','258258258','258 Vacation Street, Quận 12, TP.HCM','customer',NULL,NULL,1,'2025-10-06 16:03:16','2025-10-07 12:54:38'),(14,'customer9@gmail.com','$2a$12$vBnRmwRofSIQ75M7HVj7teqIiQm9S9KPjIMOcgpcPOg209vps5jhm','Bùi Văn Hùng','0901234578','1988-07-03','Vietnamese','369369369','369 Resort Road, Bình Thạnh, TP.HCM','customer',NULL,NULL,1,'2025-10-06 16:03:16','2025-10-07 12:54:38'),(15,'customer10@gmail.com','$2a$12$tqNFvIJTVe7ewB6MB3g8HeTGooQpKxIHEzr.lxjDpVZmQIihiZXRi','Phan Thị Hương','0901234579','1992-10-17','Vietnamese','741741741','741 Hotel Avenue, Tân Bình, TP.HCM','customer',NULL,NULL,1,'2025-10-06 16:03:16','2025-10-07 12:54:39'),(16,'iezrealcom@gmail.com','$2a$12$3wMNAxtKHUTffpbZbEDmCOfH0Fo8SLfG0bMbRuHzjgAG3X5sgasda','Người dùng123','0886528046','2007-02-19','Pháp','345345345','Cà MauvCà MauCà MauCà MauCà MauCà Mau','customer',NULL,NULL,1,'2025-10-09 03:08:47','2025-10-15 13:47:09'),(17,'iezrealcommm@gmail.com','$2a$12$F0X4WdT5nq2pnkUrj7jAZOt0lvYj85LGw.Oz8GzCkRHYZGofsP38W','Hoàng Việt','0886528045',NULL,'Vietnamese',NULL,NULL,'admin',NULL,NULL,0,'2025-10-09 17:05:43','2025-10-11 08:01:06');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `work_shifts`
--

DROP TABLE IF EXISTS `work_shifts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `work_shifts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_id` int NOT NULL,
  `shift_date` date NOT NULL,
  `shift_type` enum('morning','afternoon','night','full_day') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `status` enum('scheduled','completed','missed','cancelled') DEFAULT 'scheduled',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_staff_date_time` (`staff_id`,`shift_date`,`start_time`,`end_time`),
  KEY `idx_staff_id` (`staff_id`),
  KEY `idx_shift_date` (`shift_date`),
  KEY `idx_shift_type` (`shift_type`),
  KEY `idx_status` (`status`),
  KEY `idx_date_staff` (`shift_date`,`staff_id`),
  CONSTRAINT `work_shifts_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `work_shifts`
--

LOCK TABLES `work_shifts` WRITE;
/*!40000 ALTER TABLE `work_shifts` DISABLE KEYS */;
INSERT INTO `work_shifts` VALUES (1,3,'2025-10-06','full_day','08:00:00','17:00:00','scheduled','Ca lễ tân chính','2025-10-06 16:03:17','2025-10-06 16:03:17'),(2,3,'2025-10-07','full_day','08:00:00','17:00:00','scheduled','Ca lễ tân chính','2025-10-06 16:03:17','2025-10-06 16:03:17'),(3,3,'2025-10-08','full_day','08:00:00','17:00:00','scheduled','Ca lễ tân chính','2025-10-06 16:03:17','2025-10-06 16:03:17'),(4,3,'2025-10-09','full_day','08:00:00','17:00:00','scheduled','Ca lễ tân chính','2025-10-06 16:03:17','2025-10-06 16:03:17'),(5,3,'2025-10-10','full_day','08:00:00','17:00:00','scheduled','Ca lễ tân chính','2025-10-06 16:03:17','2025-10-06 16:03:17'),(6,4,'2025-10-06','morning','06:00:00','14:00:00','scheduled','Ca dọn dẹp sáng','2025-10-06 16:03:17','2025-10-06 16:03:17'),(7,4,'2025-10-07','morning','06:00:00','14:00:00','scheduled','Ca dọn dẹp sáng','2025-10-06 16:03:17','2025-10-06 16:03:17'),(8,4,'2025-10-08','morning','06:00:00','14:00:00','scheduled','Ca dọn dẹp sáng','2025-10-06 16:03:17','2025-10-06 16:03:17'),(9,4,'2025-10-09','morning','06:00:00','14:00:00','scheduled','Ca dọn dẹp sáng','2025-10-06 16:03:17','2025-10-06 16:03:17'),(10,4,'2025-10-10','morning','06:00:00','14:00:00','scheduled','Ca dọn dẹp sáng','2025-10-06 16:03:17','2025-10-06 16:03:17'),(11,4,'2025-10-11','morning','06:00:00','14:00:00','scheduled','Ca dọn dẹp sáng','2025-10-06 16:03:17','2025-10-06 16:03:17'),(12,5,'2025-10-06','full_day','08:00:00','18:00:00','scheduled','Ca quản lý','2025-10-06 16:03:17','2025-10-06 16:03:17'),(13,5,'2025-10-07','full_day','08:00:00','18:00:00','scheduled','Ca quản lý','2025-10-06 16:03:17','2025-10-06 16:03:17'),(14,5,'2025-10-08','full_day','08:00:00','18:00:00','scheduled','Ca quản lý','2025-10-06 16:03:17','2025-10-06 16:03:17'),(15,5,'2025-10-09','full_day','08:00:00','18:00:00','scheduled','Ca quản lý','2025-10-06 16:03:17','2025-10-06 16:03:17'),(16,5,'2025-10-10','full_day','08:00:00','18:00:00','scheduled','Ca quản lý','2025-10-06 16:03:17','2025-10-06 16:03:17'),(17,5,'2025-10-11','morning','08:00:00','14:00:00','scheduled','Ca quản lý nửa ngày','2025-10-06 16:03:17','2025-10-06 16:03:17');
/*!40000 ALTER TABLE `work_shifts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `attendance_summary`
--

/*!50001 DROP VIEW IF EXISTS `attendance_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `attendance_summary` AS select `al`.`staff_id` AS `staff_id`,`u`.`full_name` AS `staff_name`,`sp`.`department` AS `department`,cast(`al`.`check_in_time` as date) AS `attendance_date`,`al`.`check_in_time` AS `check_in_time`,`al`.`check_out_time` AS `check_out_time`,`al`.`work_hours` AS `work_hours`,`al`.`status` AS `status`,`ws`.`shift_type` AS `shift_type`,(case when (`al`.`status` = 'late') then 'Late Arrival' when (`al`.`status` = 'early_leave') then 'Early Departure' when (`al`.`status` = 'absent') then 'Absent' else 'Normal' end) AS `attendance_status` from (((`attendance_logs` `al` join `users` `u` on((`al`.`staff_id` = `u`.`id`))) join `staff_profiles` `sp` on((`u`.`id` = `sp`.`user_id`))) left join `work_shifts` `ws` on((`al`.`shift_id` = `ws`.`id`))) order by `al`.`check_in_time` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `customer_booking_summary`
--

/*!50001 DROP VIEW IF EXISTS `customer_booking_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `customer_booking_summary` AS select `u`.`id` AS `user_id`,`u`.`full_name` AS `full_name`,`u`.`email` AS `email`,count(`b`.`id`) AS `total_bookings`,sum(`b`.`total_amount`) AS `total_spent`,avg(`r`.`rating`) AS `avg_rating`,max(`b`.`created_at`) AS `last_booking_date` from ((`users` `u` left join `bookings` `b` on((`u`.`id` = `b`.`user_id`))) left join `reviews` `r` on((`b`.`id` = `r`.`booking_id`))) where (`u`.`role` = 'customer') group by `u`.`id`,`u`.`full_name`,`u`.`email` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `daily_task_summary`
--

/*!50001 DROP VIEW IF EXISTS `daily_task_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `daily_task_summary` AS select cast(`st`.`created_at` as date) AS `task_date`,`st`.`assigned_to` AS `staff_id`,`u`.`full_name` AS `staff_name`,`sp`.`department` AS `department`,count(0) AS `total_tasks`,count((case when (`st`.`status` = 'completed') then 1 end)) AS `completed_tasks`,count((case when (`st`.`status` = 'pending') then 1 end)) AS `pending_tasks`,count((case when (`st`.`status` = 'in_progress') then 1 end)) AS `in_progress_tasks`,count((case when (`st`.`priority` = 'urgent') then 1 end)) AS `urgent_tasks`,count((case when ((`st`.`due_date` < now()) and (`st`.`status` <> 'completed')) then 1 end)) AS `overdue_tasks` from ((`staff_tasks` `st` join `users` `u` on((`st`.`assigned_to` = `u`.`id`))) join `staff_profiles` `sp` on((`u`.`id` = `sp`.`user_id`))) group by cast(`st`.`created_at` as date),`st`.`assigned_to`,`u`.`full_name`,`sp`.`department` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `monthly_revenue`
--

/*!50001 DROP VIEW IF EXISTS `monthly_revenue`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `monthly_revenue` AS select year(`p`.`payment_date`) AS `year`,month(`p`.`payment_date`) AS `month`,count(`p`.`id`) AS `total_payments`,sum(`p`.`amount`) AS `total_revenue`,avg(`p`.`amount`) AS `avg_payment_amount` from `payments` `p` where (`p`.`payment_status` = 'completed') group by year(`p`.`payment_date`),month(`p`.`payment_date`) order by `year` desc,`month` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `monthly_staff_performance`
--

/*!50001 DROP VIEW IF EXISTS `monthly_staff_performance`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `monthly_staff_performance` AS select `u`.`id` AS `staff_id`,`u`.`full_name` AS `full_name`,`sp`.`department` AS `department`,`sp`.`position` AS `position`,year(`sr`.`report_date`) AS `year`,month(`sr`.`report_date`) AS `month`,sum(`sr`.`checkins_count`) AS `total_checkins`,sum(`sr`.`checkouts_count`) AS `total_checkouts`,sum(`sr`.`total_revenue`) AS `total_revenue`,count(`sr`.`id`) AS `working_days`,avg(`al`.`work_hours`) AS `avg_work_hours` from (((`users` `u` join `staff_profiles` `sp` on((`u`.`id` = `sp`.`user_id`))) left join `staff_reports` `sr` on((`u`.`id` = `sr`.`staff_id`))) left join `attendance_logs` `al` on(((`u`.`id` = `al`.`staff_id`) and (year(`al`.`check_in_time`) = year(`sr`.`report_date`)) and (month(`al`.`check_in_time`) = month(`sr`.`report_date`))))) where (`u`.`role` = 'staff') group by `u`.`id`,`u`.`full_name`,`sp`.`department`,`sp`.`position`,year(`sr`.`report_date`),month(`sr`.`report_date`) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `room_occupancy_stats`
--

/*!50001 DROP VIEW IF EXISTS `room_occupancy_stats`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `room_occupancy_stats` AS select `r`.`id` AS `id`,`r`.`room_number` AS `room_number`,`r`.`room_type` AS `room_type`,count(`b`.`id`) AS `total_bookings`,sum((case when (`b`.`status` in ('confirmed','checked_in','checked_out','completed')) then 1 else 0 end)) AS `successful_bookings`,avg(`b`.`total_amount`) AS `avg_booking_amount`,max(`b`.`created_at`) AS `last_booking_date` from (`rooms` `r` left join `bookings` `b` on((`r`.`id` = `b`.`room_id`))) group by `r`.`id`,`r`.`room_number`,`r`.`room_type` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `staff_overview`
--

/*!50001 DROP VIEW IF EXISTS `staff_overview`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `staff_overview` AS select `u`.`id` AS `id`,`u`.`email` AS `email`,`u`.`full_name` AS `full_name`,`u`.`phone` AS `phone`,`sp`.`employee_id` AS `employee_id`,`sp`.`department` AS `department`,`sp`.`position` AS `position`,`sp`.`hire_date` AS `hire_date`,`sp`.`salary` AS `salary`,`sp`.`status` AS `status`,count(distinct `ws`.`id`) AS `total_shifts`,count(distinct `st`.`id`) AS `total_tasks`,count(distinct (case when (`st`.`status` = 'completed') then `st`.`id` end)) AS `completed_tasks`,avg(`sr`.`total_revenue`) AS `avg_daily_revenue`,max(`al`.`check_in_time`) AS `last_check_in` from (((((`users` `u` left join `staff_profiles` `sp` on((`u`.`id` = `sp`.`user_id`))) left join `work_shifts` `ws` on((`u`.`id` = `ws`.`staff_id`))) left join `staff_tasks` `st` on((`u`.`id` = `st`.`assigned_to`))) left join `staff_reports` `sr` on((`u`.`id` = `sr`.`staff_id`))) left join `attendance_logs` `al` on((`u`.`id` = `al`.`staff_id`))) where (`u`.`role` = 'staff') group by `u`.`id`,`u`.`email`,`u`.`full_name`,`u`.`phone`,`sp`.`employee_id`,`sp`.`department`,`sp`.`position`,`sp`.`hire_date`,`sp`.`salary`,`sp`.`status` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-15 21:48:20
