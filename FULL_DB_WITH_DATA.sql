-- MySQL dump 10.13  Distrib 8.0.46, for macos14.8 (x86_64)
--
-- Host: db-mysql-blr1-93145-do-user-35916285-0.l.db.ondigitalocean.com    Database: defaultdb
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'edfa5079-3e57-11f1-b2ec-360540e3c522:1-605';

--
-- Table structure for table `Dislikes`
--

DROP TABLE IF EXISTS `Dislikes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Dislikes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `target_user_id` bigint NOT NULL,
  `is_mutual` tinyint(1) DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `target_user_id` (`target_user_id`),
  CONSTRAINT `Dislikes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Dislikes_ibfk_2` FOREIGN KEY (`target_user_id`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Dislikes`
--

LOCK TABLES `Dislikes` WRITE;
/*!40000 ALTER TABLE `Dislikes` DISABLE KEYS */;
/*!40000 ALTER TABLE `Dislikes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Guardians`
--

DROP TABLE IF EXISTS `Guardians`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Guardians` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `individual_id` bigint NOT NULL,
  `guardian_id` bigint NOT NULL,
  `guardian_name` varchar(255) DEFAULT NULL,
  `guardian_phone` varchar(50) DEFAULT NULL,
  `guardian_email` varchar(255) DEFAULT NULL,
  `guardian_relationship` varchar(100) DEFAULT NULL,
  `guardian_image` varchar(255) DEFAULT NULL,
  `contact_hidden` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `guardians_individual_id_guardian_id` (`individual_id`,`guardian_id`),
  KEY `guardian_id` (`guardian_id`),
  CONSTRAINT `Guardians_ibfk_1` FOREIGN KEY (`individual_id`) REFERENCES `Users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Guardians_ibfk_2` FOREIGN KEY (`guardian_id`) REFERENCES `Users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Guardians`
--

LOCK TABLES `Guardians` WRITE;
/*!40000 ALTER TABLE `Guardians` DISABLE KEYS */;
/*!40000 ALTER TABLE `Guardians` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Interests`
--

DROP TABLE IF EXISTS `Interests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Interests` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `status` enum('pending','accepted','declined') NOT NULL DEFAULT 'pending',
  `from_user` bigint NOT NULL,
  `from_guardian` bigint DEFAULT NULL,
  `from_guardian_status` enum('pending','accepted','declined') DEFAULT 'pending',
  `to_user` bigint NOT NULL,
  `to_guardian` bigint DEFAULT NULL,
  `to_guardian_status` enum('pending','accepted','declined') DEFAULT 'pending',
  `both_guardians_approved` tinyint(1) NOT NULL DEFAULT '0',
  `both_users_approved` tinyint(1) NOT NULL DEFAULT '0',
  `is_super_like` tinyint(1) NOT NULL DEFAULT '0',
  `is_mutual` tinyint(1) DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `from_user` (`from_user`),
  KEY `from_guardian` (`from_guardian`),
  KEY `to_user` (`to_user`),
  KEY `to_guardian` (`to_guardian`),
  CONSTRAINT `Interests_ibfk_1` FOREIGN KEY (`from_user`) REFERENCES `Profiles` (`individual_id`) ON UPDATE CASCADE,
  CONSTRAINT `Interests_ibfk_2` FOREIGN KEY (`from_guardian`) REFERENCES `Guardians` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Interests_ibfk_3` FOREIGN KEY (`to_user`) REFERENCES `Profiles` (`individual_id`) ON UPDATE CASCADE,
  CONSTRAINT `Interests_ibfk_4` FOREIGN KEY (`to_guardian`) REFERENCES `Guardians` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Interests`
--

LOCK TABLES `Interests` WRITE;
/*!40000 ALTER TABLE `Interests` DISABLE KEYS */;
/*!40000 ALTER TABLE `Interests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Matches`
--

DROP TABLE IF EXISTS `Matches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Matches` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user1` bigint NOT NULL,
  `user2` bigint NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Matches`
--

LOCK TABLES `Matches` WRITE;
/*!40000 ALTER TABLE `Matches` DISABLE KEYS */;
/*!40000 ALTER TABLE `Matches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Messages`
--

DROP TABLE IF EXISTS `Messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Messages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `sender_id` int NOT NULL,
  `receiver_id` int NOT NULL,
  `message` text NOT NULL,
  `interest_id` int DEFAULT NULL,
  `is_seen` tinyint(1) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Messages`
--

LOCK TABLES `Messages` WRITE;
/*!40000 ALTER TABLE `Messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `Messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Options`
--

DROP TABLE IF EXISTS `Options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Options` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `country` varchar(255) DEFAULT NULL,
  `flag` varchar(255) DEFAULT NULL,
  `currency` varchar(255) DEFAULT NULL,
  `nationalities` text,
  `cities` text,
  `mother_tongues` text,
  `religions` text,
  `sects` text,
  `castes` text,
  `professions` text,
  `all_countries` text,
  `marital_statuses` text,
  `education_levels` text,
  `body_types` text,
  `employment_types` text,
  `has_children` text,
  `practice_levels` text,
  `willing_to_relocate` text,
  `interests` text,
  `monthly_salary` text,
  `family_backgrounds` text,
  `about_me` text,
  `relationship_options` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Options`
--

LOCK TABLES `Options` WRITE;
/*!40000 ALTER TABLE `Options` DISABLE KEYS */;
/*!40000 ALTER TABLE `Options` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Otps`
--

DROP TABLE IF EXISTS `Otps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Otps` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `otp` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `user_id` bigint NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Otps`
--

LOCK TABLES `Otps` WRITE;
/*!40000 ALTER TABLE `Otps` DISABLE KEYS */;
/*!40000 ALTER TABLE `Otps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Prefs`
--

DROP TABLE IF EXISTS `Prefs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Prefs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `individual_id` bigint NOT NULL,
  `pref_gender` varchar(255) DEFAULT NULL,
  `pref_age_min` int DEFAULT NULL,
  `pref_age_max` int DEFAULT NULL,
  `pref_marital_status` text,
  `pref_nationality` text,
  `pref_country` text,
  `pref_city` varchar(255) DEFAULT NULL,
  `pref_religion` varchar(255) DEFAULT NULL,
  `pref_sect` text,
  `pref_religious_practice_level` varchar(255) DEFAULT NULL,
  `pref_height_min_inches` tinyint DEFAULT NULL,
  `pref_height_max_inches` tinyint DEFAULT NULL,
  `pref_body_type` text,
  `pref_caste` text,
  `pref_mother_tongue` text,
  `pref_education` varchar(255) DEFAULT NULL,
  `pref_employment_type` text,
  `pref_monthly_salary` varchar(255) DEFAULT NULL,
  `pref_has_children` varchar(255) DEFAULT NULL,
  `pref_willing_to_relocate` tinyint DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Prefs`
--

LOCK TABLES `Prefs` WRITE;
/*!40000 ALTER TABLE `Prefs` DISABLE KEYS */;
/*!40000 ALTER TABLE `Prefs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Profiles`
--

DROP TABLE IF EXISTS `Profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Profiles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `individual_id` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  `gender` varchar(255) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `age` int DEFAULT NULL,
  `marital_status` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `nationality` varchar(255) DEFAULT NULL,
  `education` varchar(255) DEFAULT NULL,
  `profession` varchar(255) DEFAULT NULL,
  `religious_practice_level` varchar(255) DEFAULT NULL,
  `family_background` longtext,
  `bio` longtext,
  `interests` longtext,
  `relationship` varchar(255) DEFAULT NULL,
  `contact_hidden` tinyint(1) NOT NULL DEFAULT '0',
  `last_seen` datetime DEFAULT NULL,
  `images` longtext,
  `is_guardian_required` tinyint(1) NOT NULL DEFAULT '1',
  `phone` varchar(20) DEFAULT NULL,
  `religion` varchar(255) DEFAULT NULL,
  `sect` varchar(255) DEFAULT NULL,
  `height_inches` tinyint unsigned DEFAULT NULL COMMENT 'Total inches e.g. 68 = 5ft 8in',
  `body_type` varchar(255) DEFAULT NULL,
  `caste` varchar(255) DEFAULT NULL,
  `mother_tongue` varchar(255) DEFAULT NULL,
  `employment_type` varchar(255) DEFAULT NULL,
  `monthly_salary` varchar(255) DEFAULT NULL,
  `has_children` tinyint(1) DEFAULT NULL,
  `willing_to_relocate` tinyint(1) DEFAULT '0',
  `is_profile_completed` tinyint(1) NOT NULL DEFAULT '0',
  `is_pro` tinyint(1) DEFAULT '0',
  `front_id` varchar(255) DEFAULT NULL,
  `back_id` varchar(255) DEFAULT NULL,
  `isblurred_images` tinyint(1) NOT NULL DEFAULT '0',
  `guardian_id` bigint DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `Profiles_guardian_id_foreign_idx` (`guardian_id`),
  KEY `individual_id` (`individual_id`),
  CONSTRAINT `Profiles_guardian_id_foreign_idx` FOREIGN KEY (`guardian_id`) REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Profiles_ibfk_1` FOREIGN KEY (`individual_id`) REFERENCES `Users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Profiles`
--

LOCK TABLES `Profiles` WRITE;
/*!40000 ALTER TABLE `Profiles` DISABLE KEYS */;
/*!40000 ALTER TABLE `Profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SequelizeMeta`
--

DROP TABLE IF EXISTS `SequelizeMeta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SequelizeMeta` (
  `name` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SequelizeMeta`
--

LOCK TABLES `SequelizeMeta` WRITE;
/*!40000 ALTER TABLE `SequelizeMeta` DISABLE KEYS */;
INSERT INTO `SequelizeMeta` (`name`) VALUES ('1776950178853-create-Dislikes.js'),('1776950178856-create-Guardians.js'),('1776950178860-create-Interests.js'),('1776950178863-create-Matches.js'),('1776950178865-create-Messages.js'),('1776950178871-create-Options.js'),('1776950178873-create-Otps.js'),('1776950178876-create-Prefs.js'),('1776950178881-create-Profiles.js'),('1776950178884-create-Settings.js'),('1776950178889-create-Users.js'),('1776951334663-create-Dislikes.js'),('1776951334666-create-Guardians.js'),('1776951334669-create-Interests.js'),('1776951334671-create-Matches.js'),('1776951334673-create-Messages.js'),('1776951334676-create-Options.js'),('1776951334678-create-Otps.js'),('1776951334681-create-Prefs.js'),('1776951334686-create-Profiles.js'),('1776951334688-create-Settings.js'),('1776951334691-create-Users.js'),('1776953072841-create-Dislikes.js'),('1776953072843-create-Guardians.js'),('1776953072846-create-Interests.js'),('1776953072847-create-Matches.js'),('1776953072848-create-Messages.js'),('1776953072851-create-Options.js'),('1776953072853-create-Otps.js'),('1776953072856-create-Prefs.js'),('1776953072859-create-Profiles.js'),('1776953072864-create-Settings.js'),('1776953072868-create-Users.js');
/*!40000 ALTER TABLE `SequelizeMeta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Settings`
--

DROP TABLE IF EXISTS `Settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Settings`
--

LOCK TABLES `Settings` WRITE;
/*!40000 ALTER TABLE `Settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `Settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `mobile` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('individual','guardian','admin','staff') DEFAULT 'individual',
  `avatar_url` varchar(255) DEFAULT NULL,
  `is_online` tinyint(1) DEFAULT '0',
  `is_suspended` tinyint(1) DEFAULT '0',
  `is_deleted` tinyint(1) DEFAULT '0',
  `is_verified` tinyint(1) DEFAULT '0',
  `is_premium` tinyint(1) DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `mobile` (`mobile`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'defaultdb'
--

--
-- Dumping routines for database 'defaultdb'
--
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-23 21:44:51
